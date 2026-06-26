from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Enum, ForeignKey, Text, func
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, Session
from enum import Enum as PyEnum
from passlib.context import CryptContext
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import jwt

# =====================================================
# CONFIGURATION
# =====================================================
import os
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./slot_swapper.db")
JWT_SECRET = "CHANGE_THIS_SECRET_TO_A_STRONG_RANDOM_SECRET"
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

# =====================================================
# PASSWORD HASHING
# =====================================================
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token/json")

# =====================================================
# ENUMS
# =====================================================
class EventStatus(PyEnum):
    BUSY = "BUSY"
    SWAPPABLE = "SWAPPABLE"
    SWAP_PENDING = "SWAP_PENDING"

class RequestStatus(PyEnum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"

# =====================================================
# DATABASE MODELS
# =====================================================
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    events = relationship("Event", back_populates="owner")
    outgoing_requests = relationship("SwapRequest", back_populates="requester", foreign_keys="SwapRequest.requester_id")
    incoming_requests = relationship("SwapRequest", back_populates="responder", foreign_keys="SwapRequest.responder_id")
    marketplace_items = relationship("MarketplaceItem", back_populates="owner", cascade="all, delete")

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    status = Column(Enum(EventStatus), default=EventStatus.BUSY, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="events")

class SwapRequest(Base):
    __tablename__ = "swap_requests"
    id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    responder_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    my_event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    their_event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    status = Column(Enum(RequestStatus), default=RequestStatus.PENDING, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    requester = relationship("User", foreign_keys=[requester_id], back_populates="outgoing_requests")
    responder = relationship("User", foreign_keys=[responder_id], back_populates="incoming_requests")

# =====================================================
# NEW: MARKETPLACE MODEL
# =====================================================
class MarketplaceItem(Base):
    __tablename__ = "marketplace_items"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="marketplace_items")
    created_at = Column(DateTime, server_default=func.now())

Base.metadata.create_all(bind=engine)

# =====================================================
# SCHEMAS
# =====================================================
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    class Config:
        orm_mode = True

class EventCreate(BaseModel):
    title: str
    start_time: datetime
    end_time: datetime

class EventUpdate(BaseModel):
    title: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class EventOut(BaseModel):
    id: int
    title: str
    start_time: datetime
    end_time: datetime
    status: EventStatus
    owner_id: int
    class Config:
        orm_mode = True

class SwapRequestCreate(BaseModel):
    my_event_id: int
    their_event_id: int

class SwapResponseIn(BaseModel):
    accept: bool

class SwapRequestOut(BaseModel):
    id: int
    requester_id: int
    responder_id: int
    my_event_id: int
    their_event_id: int
    status: RequestStatus
    created_at: datetime
    class Config:
        orm_mode = True

# --- Marketplace Schemas ---
class MarketplaceCreate(BaseModel):
    title: str
    description: Optional[str] = None

class MarketplaceOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    owner_id: int
    owner_name: str
    created_at: datetime
    class Config:
        orm_mode = True

# =====================================================
# FASTAPI APP CONFIG
# =====================================================
app = FastAPI(title="SlotSwapper API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# DEPENDENCIES
# =====================================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = int(payload.get("sub"))
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

# =====================================================
# ROUTES
# =====================================================
@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/signup", response_model=UserOut)
def signup(data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(name=data.name, email=data.email, password_hash=get_password_hash(data.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.post("/api/token/json", response_model=Token)
async def token_json(creds: dict = Body(...), db: Session = Depends(get_db)):
    email, password = creds.get("email"), creds.get("password")
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/api/me", response_model=UserOut)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user

# =====================================================
# EVENT (CALENDAR) ROUTES
# =====================================================
@app.post("/api/events", response_model=EventOut)
def create_event(payload: EventCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if payload.start_time >= payload.end_time:
        raise HTTPException(status_code=400, detail="start_time must be before end_time")
    event = Event(title=payload.title, start_time=payload.start_time, end_time=payload.end_time, owner_id=current_user.id)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@app.get("/api/events", response_model=List[EventOut])
def list_my_events(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Event).filter(Event.owner_id == current_user.id).order_by(Event.start_time).all()

@app.put("/api/events/{event_id}", response_model=EventOut)
def update_event(event_id: int, payload: EventUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = db.query(Event).filter(Event.id == event_id, Event.owner_id == current_user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or unauthorized")
    if payload.title is not None:
        event.title = payload.title
    if payload.start_time is not None:
        event.start_time = payload.start_time
    if payload.end_time is not None:
        event.end_time = payload.end_time
    db.commit()
    db.refresh(event)
    return event

@app.delete("/api/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = db.query(Event).filter(Event.id == event_id, Event.owner_id == current_user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or unauthorized")
    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}

@app.patch("/api/events/{event_id}/status", response_model=EventOut)
def update_event_status(event_id: int, status_in: dict = Body(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    target_status = status_in.get("status")
    if not target_status or target_status not in EventStatus.__members__:
        raise HTTPException(status_code=400, detail="Invalid status")
    event = db.query(Event).filter(Event.id == event_id, Event.owner_id == current_user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    event.status = EventStatus[target_status]
    db.commit()
    db.refresh(event)
    return event

@app.get("/api/swappable-slots", response_model=List[EventOut])
def get_swappable_slots(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Event).filter(Event.status == EventStatus.SWAPPABLE, Event.owner_id != current_user.id).order_by(Event.start_time).all()

# =====================================================
# SWAP REQUEST ROUTES
# =====================================================
@app.post("/api/requests", response_model=SwapRequestOut)
def create_swap_request(payload: SwapRequestCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    my_event = db.query(Event).filter(Event.id == payload.my_event_id, Event.owner_id == current_user.id).first()
    their_event = db.query(Event).filter(Event.id == payload.their_event_id).first()
    if not my_event or not their_event:
        raise HTTPException(status_code=404, detail="Event not found")
    if my_event.status != EventStatus.SWAPPABLE or their_event.status != EventStatus.SWAPPABLE:
        raise HTTPException(status_code=400, detail="Both events must be swappable")
    request = SwapRequest(requester_id=current_user.id, responder_id=their_event.owner_id, my_event_id=my_event.id, their_event_id=their_event.id)
    db.add(request)
    db.commit()
    db.refresh(request)
    my_event.status = EventStatus.SWAP_PENDING
    their_event.status = EventStatus.SWAP_PENDING
    db.commit()
    return request

@app.get("/api/requests", response_model=List[SwapRequestOut])
def list_my_requests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    outgoing = db.query(SwapRequest).filter(SwapRequest.requester_id == current_user.id)
    incoming = db.query(SwapRequest).filter(SwapRequest.responder_id == current_user.id)
    return outgoing.union_all(incoming).order_by(SwapRequest.created_at.desc()).all()

@app.post("/api/requests/{request_id}/respond", response_model=SwapRequestOut)
def respond_to_request(request_id: int, payload: SwapResponseIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    req = db.query(SwapRequest).filter(SwapRequest.id == request_id).first()
    if not req or req.responder_id != current_user.id:
        raise HTTPException(status_code=404, detail="Request not found or unauthorized")
    req.status = RequestStatus.ACCEPTED if payload.accept else RequestStatus.REJECTED
    db.commit()
    db.refresh(req)
    if payload.accept:
        my_event = db.query(Event).filter(Event.id == req.my_event_id).first()
        their_event = db.query(Event).filter(Event.id == req.their_event_id).first()
        if my_event and their_event:
            my_event.owner_id, their_event.owner_id = their_event.owner_id, my_event.owner_id
            my_event.status = their_event.status = EventStatus.BUSY
            db.commit()
    return req

# =====================================================
# MARKETPLACE ROUTES
# =====================================================
@app.get("/api/marketplace", response_model=List[MarketplaceOut])
def list_marketplace(db: Session = Depends(get_db)):
    items = db.query(MarketplaceItem).join(User).all()
    return [
        MarketplaceOut(
            id=item.id,
            title=item.title,
            description=item.description,
            owner_id=item.owner_id,
            owner_name=item.owner.name,
            created_at=item.created_at,
        )
        for item in items
    ]

@app.post("/api/marketplace", response_model=MarketplaceOut)
def create_marketplace_item(payload: MarketplaceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = MarketplaceItem(title=payload.title, description=payload.description, owner_id=current_user.id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return MarketplaceOut(
        id=item.id,
        title=item.title,
        description=item.description,
        owner_id=current_user.id,
        owner_name=current_user.name,
        created_at=item.created_at,
    )

@app.put("/api/marketplace/{item_id}", response_model=MarketplaceOut)
def update_marketplace_item(item_id: int, payload: MarketplaceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(MarketplaceItem).filter(MarketplaceItem.id == item_id, MarketplaceItem.owner_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found or unauthorized")
    item.title = payload.title
    item.description = payload.description
    db.commit()
    db.refresh(item)
    return MarketplaceOut(
        id=item.id,
        title=item.title,
        description=item.description,
        owner_id=item.owner_id,
        owner_name=item.owner.name,
        created_at=item.created_at,
    )

@app.delete("/api/marketplace/{item_id}")
def delete_marketplace_item(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(MarketplaceItem).filter(MarketplaceItem.id == item_id, MarketplaceItem.owner_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found or unauthorized")
    db.delete(item)
    db.commit()
    return {"message": "Item deleted successfully"}
