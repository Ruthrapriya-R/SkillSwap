from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth.models import User
from .models import Skill, UserProfile, ConnectionRequest
from .serializers import SkillSerializer, UserProfileSerializer

# 1. Get ALL Skills (for the dropdown list)
@api_view(['GET'])
def get_skills(request):
    skills = Skill.objects.all()
    serializer = SkillSerializer(skills, many=True)
    return Response(serializer.data)

# 2. Get Profiles (GET) OR Create New Profile (POST)
@api_view(['GET', 'POST'])
def get_profiles(request):
    if request.method == 'GET':
        profiles = UserProfile.objects.all()
        serializer = UserProfileSerializer(profiles, many=True)
        return Response(serializer.data)
    
    if request.method == 'POST':
        data = request.data
        
        # A. Create the User first (Auto-generate password)
        try:
            # We use 'get_or_create' so if user exists, it doesn't crash
            if User.objects.filter(username=data['username']).exists():
                return Response({"error": "Username already taken!"}, status=400)
                
            user = User.objects.create_user(username=data['username'], password='password123')
        except Exception as e:
            return Response({"error": str(e)}, status=400)

        # B. Create the Profile
        profile = UserProfile.objects.create(
            user=user,
            bio=data['bio'],
            location=data['location']
        )

        # C. Add Skills (Loop through the IDs sent from frontend)
        if 'skills_offered' in data:
            for skill_id in data['skills_offered']:
                profile.skills_offered.add(skill_id)
        
        if 'skills_wanted' in data:
            for skill_id in data['skills_wanted']:
                profile.skills_wanted.add(skill_id)

        # D. Return the new profile
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

# 3. Send Connection Request (The new "Inbox" Logic)
@api_view(['POST'])
def send_connection_request(request):
    sender_name = request.data.get('sender')
    receiver_name = request.data.get('receiver')
    
    # A. Check if both users exist
    try:
        sender = User.objects.get(username=sender_name)
        receiver = User.objects.get(username=receiver_name)
    except User.DoesNotExist:
        return Response({"error": "Sender or Receiver not found!"}, status=404)

    # B. Prevent sending to yourself
    if sender == receiver:
        return Response({"error": "You cannot connect with yourself!"}, status=400)

    # C. Create the Request (get_or_create prevents duplicates)
    ConnectionRequest.objects.get_or_create(sender=sender, receiver=receiver)
    
    return Response({"message": f"Request sent to {receiver_name}! 📨"})

@api_view(['DELETE'])
def delete_profile(request, username):
    try:
        # Find the user and delete them (Cascade deletes profile too)
        user = User.objects.get(username=username)
        user.delete()
        return Response({"message": "User deleted successfully!"})
    except User.DoesNotExist:
        return Response({"error": "User not found!"}, status=404)