# feat-auth development log

## Setup
- Branch created from master with backend-core codebase
- Cherry-picked feat-ingestion improvements (documents API, search, WAL mode, is_indexed)

## Changes made
1. **User model** (`app/models/user.py`):
   - id, email, username, hashed_password, created_at, updated_at
   - Unique constraints on email and username
   - One-to-many relationship with Document

2. **Document model update** (`app/models/document.py`):
   - `user_id` ForeignKey -> users.id with CASCADE delete
   - `owner` relationship back_populates

3. **Auth schemas** (`app/schemas/auth.py`):
   - UserRegister, UserLogin, UserResponse, TokenResponse

4. **Security utilities** (`app/core/security.py`):
   - `hash_password()` / `verify_password()` using bcrypt directly
   - `create_access_token()` / `decode_access_token()` using python-jose

5. **Auth endpoints** (`app/api/v1/auth.py`):
   - POST /api/v1/auth/register - create user, return JWT
   - POST /api/v1/auth/login - authenticate, return JWT
   - GET /api/v1/auth/me - get current user
   - `get_current_user` dependency for protected routes

6. **Protected all document/search/timeline routes**:
   - All endpoints now require valid JWT
   - Documents filtered by `user_id` for data isolation
   - ChromaDB metadata includes `user_id`, search filters by user
   - Cross-user data isolation: user A cannot see/list/get/delete user B's docs

7. **Config**: SECRET_KEY in .env.example (lazy init, defaults if not set)

## Test results
All 10 tests pass:
- Health: OK
- Register + Login: OK
- Duplicate registration rejected: OK
- Wrong password rejected: OK
- /me with token: OK
- /me without token: 401
- Upload/list/get/delete with auth: OK
- Cross-user data isolation: OK
