from enum import Enum


class ServiceTypeEnum(Enum):
    PET_SITTING = "pet_sitting"
    DOG_WALKING = "dog_walking"

class RequestStatus(Enum):
    OPEN = "OPEN"
    CANCELLED = "CANCELLED"
    ACCEPTED = "ACCEPTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
