#!/bin/bash

# Change root password on production server
# Run this script to improve server security

echo "🔐 Changing root password on production server..."
echo ""
echo "⚠️  IMPORTANT: You will be prompted to enter a NEW password twice"
echo ""

ssh root@82.165.196.49 << 'ENDSSH'
echo "Changing password for user: root"
echo ""
passwd
ENDSSH

echo ""
echo "✅ Password change complete!"
echo ""
echo "📝 IMPORTANT: Save your new password in a secure location:"
echo "   - Password manager (recommended)"
echo "   - Encrypted notes"
echo "   - Secure vault"
echo ""
echo "❌ DO NOT store it in:"
echo "   - Plain text files"
echo "   - Code repositories"
echo "   - Chat logs"
echo "   - Unencrypted documents"
