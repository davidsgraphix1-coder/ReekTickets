#!/bin/bash

# ReekTickets SMS System Testing Script
# Tests all SMS endpoints to ensure the system is working

set -e

API_URL="${1:-https://reektickets.com}"
TEST_PHONE="${2:-0273476701}"

echo "🚀 ReekTickets SMS System Test"
echo "================================"
echo "API URL: $API_URL"
echo "Test Phone: $TEST_PHONE"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test Health Check
echo -e "${YELLOW}1. Testing SMS Health Check...${NC}"
if response=$(curl -s -X GET "$API_URL/api/sms/health"); then
  if echo "$response" | grep -q "healthy\|operational"; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    echo "   Response: $response"
  else
    echo -e "${RED}✗ Health check failed${NC}"
    echo "   Response: $response"
  fi
else
  echo -e "${RED}✗ Failed to connect to SMS health endpoint${NC}"
  echo "   Make sure server is running at $API_URL"
fi

echo ""

# Test Send SMS
echo -e "${YELLOW}2. Testing Send SMS...${NC}"
if response=$(curl -s -X POST "$API_URL/api/sms/send" \
  -H 'Content-Type: application/json' \
  -d "{\"phone\": \"$TEST_PHONE\", \"message\": \"Test SMS from ReekTickets - $(date)\"}"); then
  if echo "$response" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ SMS send test passed${NC}"
    echo "   Response: ${response:0:100}..."
  else
    echo -e "${RED}✗ SMS send test failed${NC}"
    echo "   Response: $response"
  fi
else
  echo -e "${RED}✗ Failed to send SMS${NC}"
fi

echo ""

# Test Send OTP
echo -e "${YELLOW}3. Testing Send OTP...${NC}"
OTP_CODE="123456"
if response=$(curl -s -X POST "$API_URL/api/sms/send-otp" \
  -H 'Content-Type: application/json' \
  -d "{\"phone\": \"$TEST_PHONE\", \"otp\": \"$OTP_CODE\"}"); then
  if echo "$response" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ OTP send test passed${NC}"
    echo "   Response: ${response:0:100}..."
  else
    echo -e "${RED}✗ OTP send test failed${NC}"
    echo "   Response: $response"
  fi
else
  echo -e "${RED}✗ Failed to send OTP${NC}"
fi

echo ""

# Test Debug Endpoint
echo -e "${YELLOW}4. Testing Debug/Test Endpoint...${NC}"
if response=$(curl -s -X POST "$API_URL/api/sms/test" \
  -H 'Content-Type: application/json' \
  -d "{\"phone\": \"$TEST_PHONE\"}"); then
  if echo "$response" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Test endpoint passed${NC}"
    echo "   Response: ${response:0:100}..."
  else
    echo -e "${RED}✗ Test endpoint failed${NC}"
    echo "   Response: $response"
  fi
else
  echo -e "${RED}✗ Failed to call test endpoint${NC}"
fi

echo ""
echo "================================"
echo -e "${GREEN}✓ SMS System Testing Complete${NC}"
echo ""
echo "📖 For more details, see SMS_SETUP.md"
echo "💡 Tip: Check server logs for detailed SMS sending information"
