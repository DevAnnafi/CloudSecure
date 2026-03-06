import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from api.main import app
from api.core.database import Base, get_db
from api.models import Account, Scan, Finding

# Use in-memory SQLite for tests
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the database dependency
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)


# ─── Health ───────────────────────────────────────────────────────────────────

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_root():
    res = client.get("/")
    assert res.status_code == 200
    assert "CloudSecure" in res.json()["message"]


# ─── Accounts ─────────────────────────────────────────────────────────────────

def test_create_account():
    res = client.post("/accounts", json={
        "cloud_provider": "AWS",
        "account_id": "123456789012",
        "account_name": "Test Account",
        "profile": "default"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["cloud_provider"] == "AWS"
    assert data["account_name"] == "Test Account"

def test_get_accounts_empty():
    res = client.get("/accounts")
    assert res.status_code == 200
    assert res.json() == []

def test_get_accounts():
    client.post("/accounts", json={
        "cloud_provider": "AWS",
        "account_id": "123456789012",
        "account_name": "Test Account",
        "profile": "default"
    })
    res = client.get("/accounts")
    assert res.status_code == 200
    assert len(res.json()) == 1

def test_delete_account():
    create_res = client.post("/accounts", json={
        "cloud_provider": "AWS",
        "account_id": "123456789012",
        "account_name": "Test Account",
        "profile": "default"
    })
    account_id = create_res.json()["id"]
    del_res = client.delete(f"/accounts/{account_id}")
    assert del_res.status_code == 200
    accounts = client.get("/accounts").json()
    assert len(accounts) == 0

def test_delete_account_not_found():
    res = client.delete("/accounts/999")
    assert res.status_code == 404


# ─── Scans ────────────────────────────────────────────────────────────────────

def test_list_scans_empty():
    res = client.get("/scans/")
    assert res.status_code == 200
    assert res.json() == []

def test_create_scan():
    res = client.post("/scans/", json={
        "cloud_provider": "AWS",
        "account_id": "123456789012",
        "account_name": "Test Account",
        "profile": "default"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "pending"
    assert data["total_findings"] == 0

def test_get_scan():
    create_res = client.post("/scans/", json={
        "cloud_provider": "AWS",
        "account_id": "123456789012",
        "account_name": "Test Account",
        "profile": "default"
    })
    scan_id = create_res.json()["id"]
    res = client.get(f"/scans/{scan_id}")
    assert res.status_code == 200
    assert res.json()["id"] == scan_id

def test_get_scan_not_found():
    res = client.get("/scans/999")
    assert res.status_code == 404

def test_list_scans():
    client.post("/scans/", json={
        "cloud_provider": "AWS",
        "account_id": "123456789012",
        "account_name": "Test Account",
        "profile": "default"
    })
    res = client.get("/scans/")
    assert res.status_code == 200
    assert len(res.json()) == 1

def test_delete_scan():
    create_res = client.post("/scans/", json={
        "cloud_provider": "AWS",
        "account_id": "123456789012",
        "account_name": "Test Account",
        "profile": "default"
    })
    scan_id = create_res.json()["id"]
    del_res = client.delete(f"/scans/{scan_id}")
    assert del_res.status_code == 200
    res = client.get(f"/scans/{scan_id}")
    assert res.status_code == 404

def test_delete_scan_not_found():
    res = client.delete("/scans/999")
    assert res.status_code == 404


# ─── Findings ─────────────────────────────────────────────────────────────────

def test_get_findings_empty():
    create_res = client.post("/scans/", json={
        "cloud_provider": "AWS",
        "account_id": "123456789012",
        "account_name": "Test Account",
        "profile": "default"
    })
    scan_id = create_res.json()["id"]
    res = client.get(f"/findings/{scan_id}")
    assert res.status_code == 200
    assert res.json() == []

def test_get_findings_with_data():
    db = TestingSessionLocal()
    create_res = client.post("/scans/", json={
        "cloud_provider": "AWS",
        "account_id": "123456789012",
        "account_name": "Test Account",
        "profile": "default"
    })
    scan_id = create_res.json()["id"]
    finding = Finding(
        scan_id=scan_id,
        severity="CRITICAL",
        title="S3 Bucket Public",
        resource="my-bucket",
        description="Bucket is public",
        cloud_provider="AWS",
        account_id_value="123456789012",
        account_name="Test Account"
    )
    db.add(finding)
    db.commit()
    db.close()
    res = client.get(f"/findings/{scan_id}")
    assert res.status_code == 200
    assert len(res.json()) == 1
    assert res.json()[0]["severity"] == "CRITICAL"


# ─── Dashboard ────────────────────────────────────────────────────────────────

def test_dashboard_empty():
    res = client.get("/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert data["security_score"] == 100
    assert data["total_findings"] == 0
    assert data["severity"]["critical"] == 0

def test_dashboard_with_data():
    db = TestingSessionLocal()
    account = Account(
        cloud_provider="AWS",
        account_id="123456789012",
        account_name="Test Account",
        profile="default"
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    scan = Scan(
        account_id=account.id,
        status="completed",
        overall_score=70,
        total_findings=2,
        critical_count=1,
        high_count=1
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    finding = Finding(
        scan_id=scan.id,
        severity="CRITICAL",
        title="S3 Bucket Public",
        resource="my-bucket",
        description="Bucket is public",
        cloud_provider="AWS",
        account_id_value="123456789012",
        account_name="Test Account"
    )
    db.add(finding)
    db.commit()
    db.close()
    res = client.get("/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert data["total_findings"] == 1
    assert data["severity"]["critical"] == 1
    assert data["cloud_coverage"]["aws"] == 1