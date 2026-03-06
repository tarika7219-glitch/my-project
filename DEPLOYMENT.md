# Development & Deployment Guide

## Local Development Setup

### Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- OpenAI API key
- Git (optional)

### Quick Setup Steps

#### 1. Backend Setup

```powershell
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
.\venv\Scripts\Activate.ps1

# Or on Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
Copy-Item .env.example .env

# Edit .env and add your OpenAI API key
notepad .env

# Run the server
python app.py
```

Backend will be available at: `http://localhost:5000`

#### 2. Frontend Setup

```powershell
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:3000`

### Development Workflow

1. **Backend Development**
   - Edit files in `backend/` directory
   - Flask auto-reloads on file changes
   - Check console for error messages
   - API logs show all requests

2. **Frontend Development**
   - Edit files in `frontend/src/` directory
   - Vite hot-reloads on changes
   - Check browser console for errors
   - Network tab shows API calls

3. **Testing the Application**
   - Use sample files: `SAMPLE_RESUME.txt` and `SAMPLE_JOB_DESCRIPTION.txt`
   - Test with various resume and job description formats
   - Try different questions in chatbot
   - Monitor API responses

## Production Deployment

### Backend Deployment (Heroku/AWS)

#### Using Heroku

1. **Setup Heroku**
   ```bash
   heroku login
   heroku create your-app-name
   ```

2. **Add Buildpack**
   ```bash
   heroku buildpacks:set heroku/python
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set OPENAI_API_KEY=your_api_key
   heroku config:set FLASK_ENV=production
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **Check Logs**
   ```bash
   heroku logs --tail
   ```

#### Using AWS EC2

1. **Launch EC2 Instance**
   - Ubuntu 20.04 LTS
   - t2.micro or larger

2. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install python3-pip python3-venv
   sudo apt install pip install gunicorn
   ```

3. **Clone Repository**
   ```bash
   git clone your-repo-url
   cd ResumeAINew/backend
   ```

4. **Setup Python Environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

5. **Create Systemd Service**
   ```bash
   sudo nano /etc/systemd/system/resume-ai.service
   ```
   
   Add:
   ```ini
   [Unit]
   Description=Resume AI Flask App
   After=network.target
   
   [Service]
   User=ubuntu
   WorkingDirectory=/home/ubuntu/ResumeAINew/backend
   Environment="PATH=/home/ubuntu/ResumeAINew/backend/venv/bin"
   ExecStart=/home/ubuntu/ResumeAINew/backend/venv/bin/gunicorn -w 4 -b 0.0.0.0:5000 app:app
   
   [Install]
   WantedBy=multi-user.target
   ```

6. **Start Service**
   ```bash
   sudo systemctl start resume-ai
   sudo systemctl enable resume-ai
   ```

### Frontend Deployment (Vercel/Netlify)

#### Using Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

3. **Set Environment**
   ```bash
   REACT_APP_API_URL=https://your-backend-api.com/api
   ```

#### Using Netlify

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

## Environment Configuration

### Backend (.env)
```env
OPENAI_API_KEY=sk-your-api-key
FLASK_ENV=production
MAX_CONTENT_LENGTH=16777216
UPLOAD_FOLDER=uploads
```

### Frontend (.env.local)
```env
VITE_API_URL=http://your-backend-api.com/api
```

## Docker Setup (Optional)

### Backend Dockerfile

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV FLASK_APP=app.py
ENV FLASK_ENV=production

EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

### Frontend Dockerfile

```dockerfile
FROM node:16-alpine as build

WORKDIR /app
COPY package.json .
RUN npm install

COPY . .
RUN npm run build

FROM node:16-alpine

WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - FLASK_ENV=production

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://localhost:5000/api
```

Run with:
```bash
docker-compose up
```

## Performance Optimization

### Backend
- Use gunicorn/uWSGI for production
- Enable gzip compression
- Cache frequently used data
- Implement request logging
- Monitor API usage

### Frontend
- Enable code splitting
- Lazy load components
- Compress images
- Minimize bundle size
- Cache static assets

## Monitoring & Logging

### Backend Logging
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
```

### Frontend Error Tracking
```javascript
window.onerror = function(msg, url, line) {
    console.error(`Error: ${msg} at ${url}:${line}`);
};
```

## Scaling Considerations

1. **Database**: Consider moving to managed database service
2. **Caching**: Implement Redis for caching API responses
3. **Load Balancing**: Use load balancer for multiple backend instances
4. **CDN**: Use CDN for frontend static files
5. **Monitoring**: Implement monitoring and alerting

## Security Best Practices

1. **API Key Management**
   - Never commit .env files
   - Use environment variables
   - Rotate keys regularly

2. **CORS Configuration**
   - Restrict to known domains
   - Use environment-specific settings

3. **Input Validation**
   - Validate file types and sizes
   - Sanitize user input
   - Check API responses

4. **Rate Limiting**
   - Implement rate limiting for endpoints
   - Monitor API usage
   - Set up alerts for unusual activity

5. **HTTPS**
   - Always use HTTPS in production
   - Get SSL certificate (free from Let's Encrypt)

## Troubleshooting Production Issues

### High Memory Usage
- Check for memory leaks in code
- Limit request size
- Use connection pooling

### Slow API Responses
- Check OpenAI API rate limits
- Implement caching
- Optimize file processing

### CORS Errors
- Verify frontend URL in CORS settings
- Check headers in requests
- Enable monitoring

## Version Management

- Keep dependencies updated
- Test updates before deploying
- Monitor security advisories
- Document breaking changes

---

**For questions or issues, refer to the main README.md or SETUP.md**
