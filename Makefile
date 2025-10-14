.PHONY: help deploy start stop restart status logs backup restore clean update setup perms test health

# Default target
.DEFAULT_GOAL := help

# Variables
DEPLOY_SCRIPT := ./deploy.sh
ENV_FILE := .env
DOCKER_COMPOSE := docker compose --env-file $(ENV_FILE) -f .docker/docker-compose.yml
DOCKER_COMPOSE_HOSTED := docker compose --env-file $(ENV_FILE) -f .docker/docker-compose.hosted-db.yml
BACKUP_CONTAINER := salespider-backup
POSTGRES_CONTAINER := salespider-postgres

# Colors for output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

##@ General

help: ## Display this help message
	@echo "$(CYAN)SaleSpider - Makefile Commands$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make $(CYAN)<target>$(NC)\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  $(CYAN)%-15s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(YELLOW)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Setup & Permissions

perms: ## Make all scripts executable
	@echo "$(GREEN)Making scripts executable...$(NC)"
	@chmod +x deploy.sh
	@find .docker/scripts -type f -name "*.sh" -exec chmod +x {} \;
	@echo "$(GREEN)✓ All scripts are now executable$(NC)"

setup: perms ## Initial setup (permissions + environment check)
	@echo "$(GREEN)Running initial setup...$(NC)"
	@if [ ! -f "$(ENV_FILE)" ]; then \
		echo "$(YELLOW)Creating .env from example...$(NC)"; \
		cp .env $(ENV_FILE); \
		echo "$(YELLOW)⚠ Please edit .env with your configuration$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)✓ Setup complete$(NC)"

##@ Deployment

deploy: setup ## Full deployment (setup + build + start all services)
	@echo "$(GREEN)Starting full deployment...$(NC)"
	@$(DEPLOY_SCRIPT) deploy

start: ## Start all services
	@echo "$(GREEN)Starting services...$(NC)"
	@$(DEPLOY_SCRIPT) start

stop: ## Stop all services
	@echo "$(YELLOW)Stopping services...$(NC)"
	@$(DEPLOY_SCRIPT) stop

restart: ## Restart all services with health checks
	@echo "$(GREEN)Restarting services...$(NC)"
	@$(DEPLOY_SCRIPT) restart

##@ Hosted Database Deployment

deploy-hosted-db-app: setup ## Deploy app with hosted database (app + proxy only)
	@echo "$(GREEN)Starting hosted database deployment...$(NC)"
	@echo "$(CYAN)Using hosted database compose file$(NC)"
	@$(DOCKER_COMPOSE_HOSTED) up -d
	@echo "$(GREEN)✓ Hosted database deployment complete$(NC)"

start-hosted-db-app: ## Start app services for hosted database deployment
	@echo "$(GREEN)Starting app services...$(NC)"
	@$(DOCKER_COMPOSE_HOSTED) up -d

stop-hosted-db-app: ## Stop app services for hosted database deployment
	@echo "$(YELLOW)Stopping app services...$(NC)"
	@$(DOCKER_COMPOSE_HOSTED) down

restart-hosted-db-app: ## Restart app services for hosted database deployment
	@echo "$(GREEN)Restarting app services...$(NC)"
	@$(DOCKER_COMPOSE_HOSTED) restart

logs-hosted-db-app: ## Show logs for hosted database app deployment
	@$(DOCKER_COMPOSE_HOSTED) logs -f

status-hosted-db-app: ## Show status for hosted database app deployment
	@$(DOCKER_COMPOSE_HOSTED) ps

##@ Monitoring

status: ## Show service status and resource usage
	@$(DEPLOY_SCRIPT) status

logs: ## Show logs for all services (or specific: make logs SERVICE=app)
	@if [ -z "$(SERVICE)" ]; then \
		$(DEPLOY_SCRIPT) logs; \
	else \
		$(DEPLOY_SCRIPT) logs $(SERVICE); \
	fi

health: ## Check health of all services
	@echo "$(CYAN)Checking service health...$(NC)"
	@$(DOCKER_COMPOSE) ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}"

##@ Database Operations

backup: ## Trigger manual database backup (self-hosted only)
	@if [ "$(DEPLOYMENT_TYPE)" = "hosted-db" ]; then \
		echo "$(YELLOW)Database backups are managed by your hosting provider$(NC)"; \
		echo "$(CYAN)Check your provider's dashboard for backup options$(NC)"; \
	else \
		echo "$(GREEN)Starting manual backup...$(NC)"; \
		$(DEPLOY_SCRIPT) backup; \
	fi

backup-info: ## Show backup information and available restore points (self-hosted only)
	@if [ "$(DEPLOYMENT_TYPE)" = "hosted-db" ]; then \
		echo "$(YELLOW)Database backups are managed by your hosting provider$(NC)"; \
	else \
		echo "$(CYAN)Backup Repository Information:$(NC)"; \
		docker exec $(BACKUP_CONTAINER) pgbackrest --stanza=salespider info; \
	fi

backup-check: ## Verify backup integrity (self-hosted only)
	@if [ "$(DEPLOYMENT_TYPE)" = "hosted-db" ]; then \
		echo "$(YELLOW)Database backups are managed by your hosting provider$(NC)"; \
	else \
		echo "$(CYAN)Verifying backup integrity...$(NC)"; \
		docker exec $(BACKUP_CONTAINER) pgbackrest --stanza=salespider check; \
		echo "$(GREEN)✓ Backup verification complete$(NC)"; \
	fi

##@ Database Restore

restore: ## Restore from latest backup (WARNING: Overwrites current data!)
	@echo "$(RED)⚠ WARNING: This will overwrite current database data!$(NC)"
	@echo "Press Ctrl+C to cancel, or Enter to continue..."
	@read confirm
	@echo "$(YELLOW)Stopping PostgreSQL...$(NC)"
	@$(DOCKER_COMPOSE) stop postgres
	@echo "$(GREEN)Restoring from latest backup...$(NC)"
	@docker exec $(BACKUP_CONTAINER) sh /scripts/restore.sh latest
	@echo "$(GREEN)Starting PostgreSQL...$(NC)"
	@$(DOCKER_COMPOSE) start postgres
	@echo "$(GREEN)✓ Restore complete!$(NC)"

restore-pitr: ## Point-in-Time restore (Usage: make restore-pitr TIME="2024-10-04 15:30:00")
	@if [ -z "$(TIME)" ]; then \
		echo "$(RED)ERROR: TIME parameter required$(NC)"; \
		echo "Usage: make restore-pitr TIME=\"2024-10-04 15:30:00\""; \
		exit 1; \
	fi
	@echo "$(RED)⚠ WARNING: Restoring to $(TIME)$(NC)"
	@echo "Press Ctrl+C to cancel, or Enter to continue..."
	@read confirm
	@echo "$(YELLOW)Stopping PostgreSQL...$(NC)"
	@$(DOCKER_COMPOSE) stop postgres
	@echo "$(GREEN)Restoring to point-in-time: $(TIME)$(NC)"
	@docker exec $(BACKUP_CONTAINER) sh /scripts/restore.sh pitr "$(TIME)"
	@echo "$(GREEN)Starting PostgreSQL...$(NC)"
	@$(DOCKER_COMPOSE) start postgres
	@echo "$(GREEN)✓ Restore complete!$(NC)"

restore-specific: ## Restore specific backup set (Usage: make restore-specific SET="20241004-163303F")
	@if [ -z "$(SET)" ]; then \
		echo "$(RED)ERROR: SET parameter required$(NC)"; \
		echo "Usage: make restore-specific SET=\"20241004-163303F\""; \
		echo "Run 'make backup-info' to see available backup sets"; \
		exit 1; \
	fi
	@echo "$(RED)⚠ WARNING: Restoring backup set $(SET)$(NC)"
	@echo "Press Ctrl+C to cancel, or Enter to continue..."
	@read confirm
	@echo "$(YELLOW)Stopping PostgreSQL...$(NC)"
	@$(DOCKER_COMPOSE) stop postgres
	@echo "$(GREEN)Restoring backup set: $(SET)$(NC)"
	@docker exec $(BACKUP_CONTAINER) sh /scripts/restore.sh specific "$(SET)"
	@echo "$(GREEN)Starting PostgreSQL...$(NC)"
	@$(DOCKER_COMPOSE) start postgres
	@echo "$(GREEN)✓ Restore complete!$(NC)"

##@ Database Verification

db-shell: ## Open PostgreSQL shell
	@docker exec -it $(POSTGRES_CONTAINER) psql -U postgres -d salespider

db-verify: ## Verify database contents after restore
	@echo "$(CYAN)Database Verification:$(NC)"
	@echo "$(CYAN)Users:$(NC)"
	@docker exec $(POSTGRES_CONTAINER) psql -U postgres -d salespider -c "SELECT COUNT(*) as user_count FROM \"User\";"
	@echo "$(CYAN)Products:$(NC)"
	@docker exec $(POSTGRES_CONTAINER) psql -U postgres -d salespider -c "SELECT COUNT(*) as product_count FROM \"Product\";"
	@echo "$(CYAN)Sales:$(NC)"
	@docker exec $(POSTGRES_CONTAINER) psql -U postgres -d salespider -c "SELECT COUNT(*) as sales_count FROM \"Sale\";"
	@echo "$(CYAN)Latest Sale:$(NC)"
	@docker exec $(POSTGRES_CONTAINER) psql -U postgres -d salespider -c "SELECT id, \"totalAmount\", \"createdAt\" FROM \"Sale\" ORDER BY \"createdAt\" DESC LIMIT 1;"

##@ Maintenance

update: ## Update deployment (pull latest images, recreate containers)
	@echo "$(GREEN)Updating deployment...$(NC)"
	@$(DEPLOY_SCRIPT) update

clean: ## Clean up stopped containers and unused resources
	@echo "$(YELLOW)Cleaning up Docker resources...$(NC)"
	@docker system prune -f
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

reset: ## Complete reset (WARNING: Deletes all data and volumes!)
	@echo "$(RED)⚠ WARNING: This will delete ALL data and volumes!$(NC)"
	@echo "Press Ctrl+C to cancel, or type 'reset' and press Enter to continue..."
	@read confirm; \
	if [ "$$confirm" != "reset" ]; then \
		echo "$(YELLOW)Reset cancelled$(NC)"; \
		exit 1; \
	fi
	@$(DEPLOY_SCRIPT) reset

##@ Development

dev-logs: ## Show development logs with tail
	@$(DOCKER_COMPOSE) logs -f --tail=100

dev-build: ## Rebuild application without cache
	@echo "$(GREEN)Rebuilding application...$(NC)"
	@$(DOCKER_COMPOSE) build --no-cache app
	@echo "$(GREEN)✓ Build complete$(NC)"

dev-restart-app: ## Restart only the application service
	@echo "$(GREEN)Restarting application...$(NC)"
	@$(DOCKER_COMPOSE) restart app
	@echo "$(GREEN)✓ Application restarted$(NC)"

##@ Quick Access

app-shell: ## Open shell in application container
	@docker exec -it salespider-app sh

postgres-shell: ## Open shell in PostgreSQL container
	@docker exec -it $(POSTGRES_CONTAINER) sh

backup-shell: ## Open shell in backup container
	@docker exec -it $(BACKUP_CONTAINER) sh

##@ Testing

test-backup: ## Test backup system (create test backup)
	@echo "$(GREEN)Creating test backup...$(NC)"
	@docker exec $(BACKUP_CONTAINER) /usr/local/bin/backup-full.sh
	@echo "$(GREEN)✓ Test backup complete$(NC)"

test-health: ## Test all health endpoints
	@echo "$(CYAN)Testing health endpoints...$(NC)"
	@echo "App health:"
	@curl -s http://localhost/api/health | jq . || echo "App not responding"
	@echo "Database connectivity:"
	@docker exec $(POSTGRES_CONTAINER) pg_isready -U postgres

##@ Information

version: ## Show version information
	@echo "$(CYAN)SaleSpider Deployment Information$(NC)"
	@echo "Docker Compose version: $$(docker compose version)"
	@echo "Docker version: $$(docker version --format '{{.Server.Version}}')"
	@if [ -f "$(ENV_FILE)" ]; then \
		echo "Environment: $$(grep -E '^NODE_ENV=' $(ENV_FILE) | cut -d'=' -f2)"; \
	fi

ports: ## Show exposed ports
	@echo "$(CYAN)Exposed Ports:$(NC)"
	@$(DOCKER_COMPOSE) ps --format "table {{.Name}}\t{{.Ports}}"

volumes: ## Show Docker volumes
	@echo "$(CYAN)Docker Volumes:$(NC)"
	@docker volume ls | grep salespider
