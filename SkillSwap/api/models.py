from django.db import models
from django.contrib.auth.models import User

class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=100, blank=True)
    
    # The "Smart" Part: Many-to-Many Relationships
    skills_offered = models.ManyToManyField(Skill, related_name='offered_by', blank=True)
    skills_wanted = models.ManyToManyField(Skill, related_name='wanted_by', blank=True)

    def __str__(self):
        return self.user.username
    
# ... (keep your existing models)

class ConnectionRequest(models.Model):
    sender = models.ForeignKey(User, related_name='sent_requests', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_requests', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='pending') # pending, accepted, rejected

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username}"
    