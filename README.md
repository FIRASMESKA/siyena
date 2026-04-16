# Welcome to your Lovable project

## Configuration des emails de confirmation

Le projet utilise une fonction Edge Supabase pour envoyer les emails de confirmation via Gmail.

### Variables locales

Créez/complétez le fichier `.env` à la racine avec :

- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`

### Important

Ces variables servent au développement local. Pour la version déployée, ajoutez aussi les mêmes secrets dans Supabase pour la fonction `send-confirmation-email`.

```bash
supabase secrets set GMAIL_USER="votre_email@gmail.com" GMAIL_APP_PASSWORD="votre_mot_de_passe_application"
supabase functions deploy send-confirmation-email
```

### Sécurité

Le fichier `.env` est ignoré par Git pour éviter d’exposer les identifiants.
