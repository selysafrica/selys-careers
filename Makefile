DOMAIN := postule.selys.app
CERTBOT_EMAIL := dev@selys-africa.com
NGINX_CONF := deploy/nginx/$(DOMAIN).conf
NGINX_AVAILABLE := /etc/nginx/sites-available/$(DOMAIN).conf
NGINX_ENABLED := /etc/nginx/sites-enabled/$(DOMAIN).conf

.PHONY: help build up down restart logs ps nginx-install nginx-reload certbot deploy

help:
	@echo "Cibles disponibles :"
	@echo "  make build         - build l'image Docker de l'app"
	@echo "  make up            - lance l'app (docker compose up -d)"
	@echo "  make down          - arrete l'app"
	@echo "  make restart       - redemarre l'app"
	@echo "  make logs          - suit les logs de l'app"
	@echo "  make nginx-install - installe/active la config nginx pour $(DOMAIN)"
	@echo "  make certbot       - genere/renouvelle le certificat SSL via certbot"
	@echo "  make deploy        - build + up + nginx-install + certbot (pipeline complet)"

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

restart: down up

logs:
	docker compose logs -f

ps:
	docker compose ps

nginx-install:
	sudo cp $(NGINX_CONF) $(NGINX_AVAILABLE)
	sudo ln -sf $(NGINX_AVAILABLE) $(NGINX_ENABLED)
	sudo nginx -t
	sudo systemctl reload nginx

nginx-reload:
	sudo nginx -t
	sudo systemctl reload nginx

certbot:
	sudo certbot --nginx -d $(DOMAIN) --non-interactive --agree-tos -m $(CERTBOT_EMAIL) --redirect
	sudo nginx -t
	sudo systemctl reload nginx

deploy: build up nginx-install certbot
	@echo "Deploiement termine. https://$(DOMAIN)"
