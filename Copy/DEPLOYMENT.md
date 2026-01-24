
# Explication du déploiement du projet DZ-Kitab

L'équipe a déployé le projet DZ-Kitab (frontend et backend) sur la plateforme Render, en utilisant l'intégration continue (CI/CD) avec GitHub. Voici les étapes et choix techniques principaux, à destination de l'enseignant :

---


**1. Hébergement du code**
Le code source est hébergé sur GitHub, dans le dépôt :
- https://github.com/BillalBRAHAMI/DZ-Kitab_1CS7 (branche Billal)


**2. Déploiement automatique (CI/CD)**
Le dépôt GitHub est connecté à Render. À chaque push sur la branche Billal, Render déploie automatiquement le frontend et le backend.


**3. Base de données**
Nous utilisons une base de données MySQL gratuite hébergée sur TiDB Cloud. Les informations de connexion sont configurées dans les variables d'environnement Render.


**4. Stockage des images**
Les images (profils, annonces) sont stockées sur Cloudinary pour garantir leur persistance, car Render ne conserve pas les fichiers locaux.


**5. Envoi d'emails**
L'envoi d'emails transactionnels (inscription, notifications) est géré via le service Resend.


**6. Variables d'environnement**
Toutes les clés/API et accès sensibles sont stockées dans les variables d'environnement Render (voir tableau ci-dessous).

| Variable                | Valeur (exemple)                                  |
|-------------------------|---------------------------------------------------|
| CLOUDINARY_API_KEY      | 332944715985943                                   |
| CLOUDINARY_API_SECRET   | Y3XRLBnpVG4vH5jeCl2UlF_kgzk                      |
| CLOUDINARY_CLOUD_NAME   | dzkm6vuxt                                         |
| DB_HOST                 | gateway01.eu-central-1.prod.aws.tidbcloud.com     |
| DB_NAME                 | test                                              |
| DB_PASSWORD             | rA8VfMEZjYFgF3lu                                  |
| DB_PORT                 | 4000                                              |
| DB_SSL                  | true                                              |
| DB_USER                 | 23je3EBJJuNt6Yv.root                              |
| EMAIL_FROM              | onboarding@resend.dev                             |
| JWT_SECRET              | pizza123                                          |
| NODE_ENV                | production                                        |
| RESEND_API_KEY          | re_YnJo1YmW_893SWDmzTjGyag1gABMfhm7i              |
| SKIP_DB_CREATE          | true                                              |


**7. Résultat**
Après chaque déploiement, Render fournit deux liens publics :
- Frontend (interface utilisateur) : https://frontend-x7sg.onrender.com
- Backend (API) : https://backend-b1zf.onrender.com
L'application est ainsi accessible en ligne et prête à être testée ou présentée.


