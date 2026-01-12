from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Tenant, User
from app.services.security import get_password_hash

def seed_data():
    db: Session = SessionLocal()

    try:
        # check if already seeded
        if db.query(User).first():
            return

        tenant = Tenant(name="tenant1")
        db.add(tenant)
        db.commit()
        db.refresh(tenant)

        user = User(
            email="user1@tenant1.com",
            password_hash=get_password_hash("password123"),
            tenant_id=tenant.id,
        )

        db.add(user)
        db.commit()

        print("✅ Seeded tenant and demo user")

    finally:
        db.close()
