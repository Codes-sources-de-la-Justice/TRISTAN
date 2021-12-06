worker: celery --workdir src -A analyzer:celery_app worker -E -l INFO
sps: json-server contrib/sps-mock/db.json --port 3001 --static contrib/sps-mock/public
frontend: npm run start-vite
api: python src/manage.py runserver
