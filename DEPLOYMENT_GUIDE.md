# 🚀 Complete Deployment Guide

## 🎯 One-Click Deployment Options

### Option 1: Railway (Recommended - Easiest)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/relaxer196-design/color-trading-platform)

**Steps:**
1. Click the button above
2. Sign in with GitHub
3. Add MongoDB plugin (click "New" → "Database" → "MongoDB")
4. Add these environment variables:
   - `JWT_SECRET`: Generate using: `openssl rand -hex 32`
   - `RAZORPAY_KEY_ID`: Get from Razorpay dashboard
   - `RAZORPAY_KEY_SECRET`: Get from Razorpay dashboard
5. Deploy! 🎉

**Railway will automatically:**
- Install dependencies
- Start the server
- Provide a live URL
- Auto-deploy on GitHub pushes

---

### Option 2: Render (Free Tier Available)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

**Steps:**
1. Click the button above
2. Connect your GitHub account
3. Select repository: `relaxer196-design/color-trading-platform`
4. Render will detect `render.yaml` automatically
5. Add environment variables in Render dashboard
6. Deploy!

---

### Option 3: Vercel (Serverless)

**Steps:**
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts
4. Add environment variables: `vercel env add`

---

## 🔑 Getting API Keys

### 1. MongoDB Atlas (Database) - FREE

**URL**: https://www.mongodb.com/cloud/atlas/register

**Steps:**
1. Sign up for free account
2. Create a new cluster (M0 Free tier)
3. Create database user (username + password)
4. Whitelist IP: `0.0.0.0/0` (allow all)
5. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy the URI (looks like):
     ```
     mongodb+srv://username:password@cluster.mongodb.net/color-trading?retryWrites=true&w=majority
     ```
6. Replace `<password>` with your actual password

**Time**: 5 minutes

---

### 2. JWT Secret (Authentication) - FREE

**Generate using terminal:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Or use:**
```bash
openssl rand -hex 32
```

**Or manually create:** Any random 32+ character string
```
my_super_secret_jwt_key_change_this_to_something_random_12345
```

**Time**: 1 minute

---

### 3. Razorpay (Payment Gateway) - FREE Test Mode

**URL**: https://razorpay.com/

**Steps:**
1. Sign up for account
2. Skip KYC for test mode
3. Go to: **Settings** → **API Keys** → **Generate Test Key**
4. You'll get:
   - **Key ID**: `rzp_test_xxxxxxxxxx`
   - **Key Secret**: `xxxxxxxxxx`
5. Use test keys for development (no real money)

**Test Cards:**
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

**Time**: 3 minutes

---

## 📋 Environment Variables Checklist

Copy these to your deployment platform:

```env
# Required
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/color-trading
JWT_SECRET=your_generated_random_secret_here
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Optional (defaults work fine)
PORT=3000
NODE_ENV=production
```

---

## 🎬 Quick Local Testing

Before deploying, test locally:

```bash
# Clone repository
git clone https://github.com/relaxer196-design/color-trading-platform.git
cd color-trading-platform

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your API keys
nano .env  # or use any text editor

# Start server
npm start

# Visit in browser
open http://localhost:3000
```

---

## ✅ Post-Deployment Checklist

After deployment:

1. **Create Admin Account**
   - Register a new user
   - Manually set `isAdmin: true` in MongoDB
   - Or use MongoDB Compass to edit user document

2. **Test Features**
   - ✅ User registration/login
   - ✅ Place a bet
   - ✅ Deposit money (test mode)
   - ✅ Admin panel access
   - ✅ Generate game result

3. **Security**
   - Change default admin password
   - Enable 2FA on Razorpay
   - Restrict MongoDB IP whitelist (production)
   - Use strong JWT secret

---

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
- Check MongoDB URI is correct
- Verify IP whitelist includes `0.0.0.0/0`
- Ensure database user has read/write permissions

### "Razorpay payment failed"
- Verify you're using test keys for development
- Check Razorpay dashboard for errors
- Use test card: `4111 1111 1111 1111`

### "Server not starting"
- Check all environment variables are set
- Verify Node.js version >= 18
- Check logs in deployment platform

---

## 📞 Support

- **GitHub Issues**: https://github.com/relaxer196-design/color-trading-platform/issues
- **Documentation**: See README.md

---

## 🎉 Success!

Once deployed, you'll have:
- ✅ Live color trading platform
- ✅ Admin panel at `/admin`
- ✅ Real-time game updates
- ✅ Payment integration
- ✅ User management system

**Default Admin Login:**
- Create a user, then manually set `isAdmin: true` in MongoDB

---

## 📊 Platform Comparison

| Platform | Free Tier | Auto-Deploy | Database | Best For |
|----------|-----------|-------------|----------|----------|
| Railway | 500 hrs/mo | ✅ | MongoDB plugin | Easiest setup |
| Render | 750 hrs/mo | ✅ | External only | Free tier |
| Vercel | Unlimited | ✅ | External only | Serverless |
| Heroku | Deprecated | ❌ | Add-ons | Legacy |

**Recommendation**: Start with Railway for easiest setup!

---

Made with ❤️ by Bhindi