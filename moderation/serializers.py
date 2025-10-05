from rest_framework import serializers
from .models import PolicyDocument, ModerationResult, ViolationDetail

class PolicyDocumentSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = PolicyDocument
        fields = ['id', 'user', 'user_username', 'file', 'filename', 'file_size', 'uploaded_at']
        read_only_fields = ['id', 'user', 'uploaded_at']

class ViolationDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = ViolationDetail
        fields = ['id', 'chunk_id', 'chunk_text', 'verdict', 'explanation', 'sources']

class ModerationResultSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    violations = ViolationDetailSerializer(many=True, read_only=True)
    
    class Meta:
        model = ModerationResult
        fields = [
            'id', 'user', 'user_username', 'file', 'filename', 'verdict',
            'total_chunks', 'allowed_chunks', 'review_chunks', 'violation_chunks',
            'created_at', 'violations'
        ]
        read_only_fields = ['id', 'user', 'created_at']

class ModerationResultListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for listing moderation results (without violations)
    """
    user_username = serializers.CharField(source='user.username', read_only=True)
    violation_count = serializers.IntegerField(source='violations.count', read_only=True)
    
    class Meta:
        model = ModerationResult
        fields = [
            'id', 'user_username', 'filename', 'verdict',
            'total_chunks', 'allowed_chunks', 'review_chunks', 'violation_chunks',
            'violation_count', 'created_at'
        ]