#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install requirements
pip install -r requirements.txt

# Collect static files (CSS/Images)
python manage.py collectstatic --no-input

# Update Database
python manage.py migrate