# Testing Guide for Authentication

## 🧪 Three Ways to Test

### 1. Manual Testing with cURL (Quick & Easy)
### 2. Integration Tests in Go (Automated)
### 3. Postman/API Testing Tools (Visual)

---

## 1️⃣ Manual Testing with cURL

### Prerequisites
```bash
# Start backend server
cd backend
go run cmd/server/main.go
```

### Test Email Verification - New User Flow

**Step 1: Send verification code**
```bash
curl -X POST http://localhost:8080/api/v1/auth/email/send-code \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com"}'
```

Expected Response:
```json
{
  "message": "Verification code sent to your email",
  "expires_at": "2026-01-01T12:10:00Z"
}
```

**Check server terminal** for the verification code:
```
📧 Verification code for newuser@example.com: 123456
```

**Step 2: Verify code WITHOUT role (new user scenario)**
```bash
curl -X POST http://localhost:8080/api/v1/auth/email/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "code": "123456"
  }'
```

Expected Response (202 Accepted - new user needs role):
```json
{
  "is_new_user": true,
  "email": "newuser@example.com",
  "provider": "email"
}
```

**Step 3: Resend code and verify WITH role**
```bash
# Request new code (old code is already used)
curl -X POST http://localhost:8080/api/v1/auth/email/send-code \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com"}'

# Copy new code from terminal output

# Verify with role selection
curl -X POST http://localhost:8080/api/v1/auth/email/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "code": "654321",
    "role": "mentor"
  }'
```

Expected Response (200 OK - user created):
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "newuser@example.com",
    "role": "mentor",
    "created_at": "2026-01-01T12:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Step 4: Login with existing user (same email)**
```bash
# Send code for existing user
curl -X POST http://localhost:8080/api/v1/auth/email/send-code \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com"}'

# Verify code (existing user - no role needed, returns 200 directly)
curl -X POST http://localhost:8080/api/v1/auth/email/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "code": "789012"
  }'
```

Expected Response (200 OK - existing user):
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "newuser@example.com",
    "role": "mentor",
    "created_at": "2026-01-01T12:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Test Error Cases

**Invalid code:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/email/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "000000"
  }'
```

Expected: `401 Unauthorized - Verification failed`

**Expired code:**
```bash
# Wait more than 10 minutes, then try to verify
# Or modify database directly: UPDATE email_verifications SET expires_at = NOW() - INTERVAL '1 minute'

curl -X POST http://localhost:8080/api/v1/auth/email/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456"
  }'
```

Expected: `401 Unauthorized - Verification failed`

**Invalid role:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/email/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456",
    "role": "admin"
  }'
```

Expected: `400 Bad Request - Invalid input`

---

## 2️⃣ Integration Tests in Go

### Run Tests

```bash
# Run all tests
cd backend
go test ./tests -v

# Run specific test
go test ./tests -run TestEmailVerificationSendCode -v

# Run with coverage
go test ./tests -cover
```

### Test Files

- `backend/tests/auth_test.go` - Email verification and OAuth tests

### Example Test Output

```
=== RUN   TestEmailVerificationSendCode
--- PASS: TestEmailVerificationSendCode (0.15s)
=== RUN   TestEmailVerificationVerifyCode
--- PASS: TestEmailVerificationVerifyCode (0.20s)
=== RUN   TestEmailVerificationNewUserWithoutRole
--- PASS: TestEmailVerificationNewUserWithoutRole (0.18s)
=== RUN   TestEmailVerificationInvalidCode
--- PASS: TestEmailVerificationInvalidCode (0.12s)
=== RUN   TestEmailVerificationExpiredCode
--- PASS: TestEmailVerificationExpiredCode (0.14s)
=== RUN   TestOAuthExistingUser
--- PASS: TestOAuthExistingUser (0.16s)

ok      mentori/tests   1.234s  coverage: 78.5%
```

### Write Your Own Test

Template:
```go
func TestMyAuthFlow(t *testing.T) {
    // Setup
    setupTestDB(t)
    userRepo := gormrepo.NewUserRepository(database.GetDB())
    handler := handlers.NewEmailVerificationHandler(userRepo, "test-secret")

    // Create request
    reqBody := models.EmailVerificationRequest{
        Email: "test@example.com",
    }
    body, _ := json.Marshal(reqBody)

    // Execute
    req := httptest.NewRequest("POST", "/auth/email/send-code", bytes.NewBuffer(body))
    req.Header.Set("Content-Type", "application/json")
    w := httptest.NewRecorder()
    ctx := createTestGinContext(w, req)
    handler.SendVerificationCode(ctx)

    // Assert
    assert.Equal(t, http.StatusOK, w.Code)
    // ... more assertions
}
```

---

## 3️⃣ Postman Testing

### Setup Postman Environment

1. **Create Collection**: `Mentori Auth`
2. **Create Environment**: `Local Dev`
   
   Variables:
   ```
   base_url = http://localhost:8080
   api_prefix = /api/v1
   email = test@example.com
   code = 123456
   token = (automatically set after login)
   ```

### Create Requests

#### 1. Send Verification Code
```
POST {{base_url}}{{api_prefix}}/auth/email/send-code

Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "email": "{{email}}"
}

Pre-request Script:
// Clear code variable
pm.environment.unset("code");

Tests (JavaScript):
pm.test("Status is 200", function() {
    pm.response.to.have.status(200);
});

pm.test("Response has message", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.message).to.include("sent");
});
```

#### 2. Extract Code from Server (Manual)
Copy the code printed in server terminal: `📧 Verification code for test@example.com: 123456`

#### 3. Verify Code (New User)
```
POST {{base_url}}{{api_prefix}}/auth/email/verify

Body (raw JSON):
{
  "email": "{{email}}",
  "code": "123456"
}

Tests:
pm.test("New user returns 202", function() {
    pm.response.to.have.status(202);
});

pm.test("Response indicates new user", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.is_new_user).to.equal(true);
});
```

#### 4. Send Code Again & Verify with Role
```
Request: Send Code (as before)

POST {{base_url}}{{api_prefix}}/auth/email/verify

Body (raw JSON):
{
  "email": "{{email}}",
  "code": "654321",
  "role": "mentor"
}

Tests:
pm.test("User created returns 200", function() {
    pm.response.to.have.status(200);
});

pm.test("Token is set", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.token).to.be.a("string");
    pm.expect(jsonData.token.length).to.be.greaterThan(0);
    // Save token for future requests
    pm.environment.set("token", jsonData.token);
});

pm.test("User role is mentor", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.user.role).to.equal("mentor");
});
```

#### 5. Login (Existing User)
```
POST {{base_url}}{{api_prefix}}/auth/email/verify

Body (raw JSON):
{
  "email": "{{email}}",
  "code": "789012"
}

Tests:
pm.test("Existing user returns 200", function() {
    pm.response.to.have.status(200);
});

pm.test("User data matches", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.user.email).to.equal(pm.environment.get("email"));
    pm.expect(jsonData.user.role).to.equal("mentor");
});
```

### Run Postman Test Runner

```bash
# Install Newman (CLI runner)
npm install -g newman

# Run collection
newman run "Mentori Auth.postman_collection.json" \
  -e "Local Dev.postman_environment.json" \
  -r html,cli

# Output will show all test results
```

---

## 4️⃣ Testing Checklist

### Email Verification Tests
- [ ] Send code to new email → 200 OK
- [ ] Verify code without role (new user) → 202 Accepted
- [ ] Send new code → 200 OK
- [ ] Verify code with role → 200 OK, user created
- [ ] Verify same code again → 401 (used)
- [ ] Login existing user → 200 OK
- [ ] Invalid code → 401
- [ ] Expired code → 401
- [ ] Multiple codes in queue → Only latest valid

### OAuth Tests
- [ ] Google OAuth new user → 202 Accepted
- [ ] Google OAuth with role → 200 OK, user created
- [ ] Google OAuth existing user → 200 OK
- [ ] Apple OAuth new user → 202 Accepted
- [ ] Apple OAuth with role → 200 OK, user created
- [ ] Apple OAuth existing user → 200 OK
- [ ] Invalid OAuth token → 401
- [ ] Malformed request → 400

### Database Tests
- [ ] User created with correct provider
- [ ] User created with correct role
- [ ] Email verification marked as used
- [ ] Expired codes are ignored
- [ ] User can't login with same code twice

### Integration Tests
- [ ] Switch providers (Google then email) → Different accounts
- [ ] Same email different providers → Separate users
- [ ] User profile missing for new users → Handled gracefully
- [ ] Multiple users simultaneous verification → No conflicts

---

## 🐛 Debugging

### Enable Debug Logging

**Backend:**
```bash
# Set environment variable
export LOG_LEVEL=debug
go run cmd/server/main.go
```

**View Database:**
```bash
# PostgreSQL
psql $DATABASE_URL

# Check email verifications
SELECT * FROM email_verifications WHERE email = 'test@example.com';

# Check users
SELECT id, email, provider, provider_id, role, is_verified FROM users WHERE email = 'test@example.com';

# Check codes
SELECT email, code, expires_at, is_used FROM email_verifications ORDER BY created_at DESC LIMIT 10;
```

### Common Issues

**Issue: Code expires too fast**
- Check: `expires_at` in database - should be 10 minutes in future
- Solution: Verify system time is correct

**Issue: Code not showing in terminal**
- Check: `LOG_LEVEL=debug` environment variable
- Check: Service function is being called
- Solution: Add print statements in `SendVerificationEmail()`

**Issue: Same code works twice**
- Check: Database - `is_used` should be `true` after first use
- Solution: Verify UPDATE query in service

**Issue: Wrong role validation**
- Check: Request has `role: "invalid"`
- Solution: Database constraint should reject, or handler validation

---

## 📊 Performance Testing

### Load Testing with Apache Bench

```bash
# Test send-code endpoint
ab -n 100 -c 10 -p send-code.json \
  -T application/json \
  http://localhost:8080/api/v1/auth/email/send-code

# Test verify endpoint
ab -n 100 -c 10 -p verify.json \
  -T application/json \
  http://localhost:8080/api/v1/auth/email/verify
```

### Monitor Response Times

```
Requests per second:    1000 req/sec
Time per request:       10ms (average)
Max time:               50ms
```

---

## ✅ Pre-Deployment Testing

Before going to production:

- [ ] All manual cURL tests pass
- [ ] All Go integration tests pass (100% coverage)
- [ ] Postman collection passes completely
- [ ] Database migration runs without errors
- [ ] Email service integration works
- [ ] OAuth tokens verified correctly
- [ ] Rate limiting works (if implemented)
- [ ] Error messages are user-friendly
- [ ] No sensitive data in logs/errors
- [ ] JWT tokens valid and expiring correctly

---

## 🚀 CI/CD Testing

### GitHub Actions Example

```yaml
name: Auth Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Go
        uses: actions/setup-go@v4
        with:
          go-version: 1.25
      
      - name: Run tests
        run: |
          cd backend
          go test ./tests -v -cover
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

Save as: `.github/workflows/test.yml`
