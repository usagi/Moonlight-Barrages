all: deploy-demo

.PHONY: deploy-demo
deploy-demo:
	rsync -av --delete ./ demo.WonderRabbitProject.net:/srv/http/WonderRabbitProject.net/demo/moonlight_barrages
