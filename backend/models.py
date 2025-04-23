# SQLAlchemy models
from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class Recipient(Base):
    __tablename__ = 'recipients'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    medicaid_id = Column(String)
    constant1 = Column(String)
    constant2 = Column(String)

class Schedule(Base):
    __tablename__ = 'schedules'
    id = Column(Integer, primary_key=True)
    recipient_id = Column(Integer, ForeignKey('recipients.id'))
    weekday = Column(String)
    service_type = Column(String)

class BillingEntry(Base):
    __tablename__ = 'billing_entries'
    id = Column(Integer, primary_key=True)
    date = Column(Date)
    recipient_id = Column(Integer, ForeignKey('recipients.id'))
    work_units = Column(Integer)
    trip_units = Column(Integer)

# Setup
engine = create_engine("sqlite:///db.sqlite3")
SessionLocal = sessionmaker(bind=engine)

def init_db():
    Base.metadata.create_all(engine)
