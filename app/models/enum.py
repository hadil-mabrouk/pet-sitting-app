from enum import Enum


class ServiceTypeEnum(Enum):
    PET_SITTING = "pet_sitting"
    DOG_WALKING = "dog_walking"
    PET_RESCUE = "pet_rescue"
    PET_TAXI = "pet_taxi"
class RequestStatus(Enum):
    OPEN = "OPEN"
    CANCELLED = "CANCELLED"
    ACCEPTED = "ACCEPTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
class OfferStatus(Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
class BookingStatus(Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"  # optional for later
