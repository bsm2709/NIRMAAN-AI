import argparse
import sys
from werkzeug.security import generate_password_hash


def main() -> int:
    parser = argparse.ArgumentParser(description="Reset a user's password (hashed) in the database")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--email', help='User email to identify the account')
    group.add_argument('--username', help='Username to identify the account')
    parser.add_argument('--password', required=True, help='New plaintext password to set (will be hashed)')
    args = parser.parse_args()

    # Lazy import app to avoid circulars
    from backend import create_app, db
    from backend.models.user import create_user_model

    app = create_app()
    User = create_user_model(db)

    with app.app_context():
        query = None
        if args.email:
            query = User.query.filter_by(email=args.email)
        else:
            query = User.query.filter_by(username=args.username)

        user = query.first()
        if not user:
            print('User not found', file=sys.stderr)
            return 1

        user.password_hash = generate_password_hash(args.password)
        db.session.commit()
        print(f"Password reset for user id={user.id}, username={user.username}, email={user.email}")
        return 0


if __name__ == '__main__':
    raise SystemExit(main())



