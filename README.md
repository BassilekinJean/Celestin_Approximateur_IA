# 🤖 Célestin l'Approximateur

> Célestin, une IA loin de la productivité poursuivant l'amusement — par **FS_Team1**

Célestin est un chatbot amusant basé sur Spring Boot et l'API Google Gemini. Il répond toujours à côté de la plaque, pour votre plus grand plaisir !

> Warning : Le Modèle utiliser Gemini 2.0 à des tokens limités vu qu'il s'agit d'une demo.
---

## 📋 Prérequis

### Pour Docker (recommandé)
- [Docker](https://docs.docker.com/get-docker/) 20.10+
- [Docker Compose](https://docs.docker.com/compose/install/) v2+

### Pour le développement local
- Java 21 (JDK)
- Maven 3.9+

---

## 🚀 Démarrage rapide

### Avec Docker Compose (recommandé)

```bash
# Cloner le projet
git clone https://github.com/BassilekinJean/Celestin_Approximateur_IA.git
cd Celestin_Approximateur_IA

# Lancer l'application
docker-compose up -d

# Voir les logs
docker-compose logs -f
```

L'application sera accessible sur **http://localhost:8080**

### Avec Docker uniquement

```bash
# Construire l'image
docker build -t celestin-chatbot .

# Lancer le conteneur
docker run -d -p 8080:8080 --name celestin celestin-chatbot

# Arrêter le conteneur
docker stop celestin
```

---

## 🔧 Configuration

### Variables d'environnement

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `GOOGLE_GEMINI_API_KEY` | Clé API Google Gemini | *(voir application.properties)* |
| `SPRING_PROFILES_ACTIVE` | Profil Spring actif | `docker` |

### Personnaliser la clé API

```bash
# Option 1: Variable d'environnement
export GOOGLE_GEMINI_API_KEY=votre_cle_api
docker-compose up -d

# Option 2: Fichier .env
echo "GOOGLE_GEMINI_API_KEY=votre_cle_api" > .env
docker-compose up -d
```

---

## 💻 Développement local

```bash
cd celestin_chatbot

# Lancer l'application
./mvnw spring-boot:run

# Compiler uniquement
./mvnw compile

# Lancer les tests
./mvnw test

# Créer le JAR
./mvnw package -DskipTests
```

---

## 📁 Structure du projet

```
Celestin_Approximateur_IA/
├── Dockerfile              # Configuration Docker multi-stage
├── docker-compose.yml      # Orchestration Docker
├── .dockerignore           # Fichiers exclus du build Docker
├── README.md               # Cette documentation
└── celestin_chatbot/       # Application Spring Boot
    ├── pom.xml             # Dépendances Maven
    ├── mvnw                # Maven Wrapper
    └── src/
        ├── main/
        │   ├── java/       # Code source Java
        │   └── resources/  # Configuration & templates
        └── test/           # Tests unitaires
```

---

## 🛠️ Technologies

- **Backend**: Spring Boot 3.4.6
- **Java**: 21
- **IA**: Google Gemini API
- **Template**: Thymeleaf
- **Build**: Maven

---

## 📝 Commandes Docker utiles

```bash
# Voir les conteneurs en cours
docker ps

# Voir les logs en temps réel
docker-compose logs -f celestin-chatbot

# Redémarrer l'application
docker-compose restart

# Arrêter et supprimer
docker-compose down

# Reconstruire après modifications
docker-compose up -d --build

# Nettoyer les images non utilisées
docker image prune
```

---

## 🏥 Health Check

L'application expose un endpoint de santé via Spring Actuator :

```bash
curl http://localhost:8080/actuator/health
```

---

## 👥 Équipe

Développé avec ❤️ par **FS_Team1**

---

## 📄 Licence

Ce projet est à usage éducatif.
