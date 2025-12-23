from rest_framework import serializers
from .models import Skill, UserProfile
from django.contrib.auth.models import User

# Translator for Skills (e.g., "Python")
class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']

# Translator for Users (e.g., "Ruthrapriya")
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

# Translator for Profiles (Connects User + Skills)
class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    skills_offered = SkillSerializer(many=True)
    skills_wanted = SkillSerializer(many=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'bio', 'location', 'skills_offered', 'skills_wanted']
        