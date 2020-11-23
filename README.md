# TP Progressive Web Applications
Ce dépôt contient les ressources nécessaires pour le TP du module *Architectures Logicielles et Programmation Mobile* (SAMP) consacré à la partie PWA. 

## Objectifs du TP

Dans ce TP, on s'intéressera aux étapes nécessaires à déployer une simple application web sous forme de PWA, en réalisant les étapes suivantes : 
- hébergement de l'application sur un serveur en HTTPS
- écriture d'un fichier manifest pour rendre l'application installable
- écriture d'une première version d'un service worker destiné à mettre des données en cache à l'installation et lors de l'accès au réseau
- amélioration du service worker pour implanter une stratégie ad hoc de service de contenu

Pour les plus rapides :
- évolution de l'application pour utiliser une API mobile spécifique (ici, le GPS). 

## Sujet du TP

Le sujet du TP est disponible à l'adresse : [/sujet](./sujet/index.html){:target="_blank"}

On s'intéresse dans celui-ci à une application Ginkobus qui permet de consulter les horaires de bus de la ville de Besançon, à partir des données ouvertes proposées par Ginko Mobilités (disponibles à l'adresse [https://api.ginko.voyage](https://api.ginko.voyage)).

## Corrigé du TP
L'application finale est disponible dans le dossier [webapp](./webapp){:target="_blank"} du dépôt. 

Vous pouvez consulter :
- le code du fichier manifest 
- le code du service worker

L'application étant hébergée sur Github, et servie en HTTPS, elle est normalement installable sur un appareil mobile récent. 

[Lancer l'application](https://fdadeau.github.io/ginkobusPWA/){:target="_blank"}
