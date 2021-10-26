from rest_framework import serializers
from api.models import AnalysisResult, AnalysisTicket

class AnalysisTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisTicket
        fields = ['id', 'case_id', 'status', 'created_at', 'updated_at']

class AnalysisResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisResult
        fields = ['id', 'created_at', 'updated_at', 'parent_ticket', 'payload']
        depth = 1
