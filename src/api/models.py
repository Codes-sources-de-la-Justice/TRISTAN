from django.db import models
from django.db.models import Q
from django.core.serializers.json import DjangoJSONEncoder

class AnalysisTicket(models.Model):
    PENDING = 'PG'
    IN_PROGRESS = 'IP'
    DONE = 'DE'
    ERROR = 'ER'
    PAUSED = 'PD'
    ANALYSIS_TICKET_CHOICES = [
        (PENDING, 'Pending'),
        (IN_PROGRESS, 'In progress'),
        (DONE, 'Done'),
        (ERROR, 'Error'),
        (PAUSED, 'Paused')
    ]
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    case_id = models.UUIDField(editable=False)
    task_id = models.UUIDField(null=True, default=None)
    status = models.CharField(max_length=2, choices=ANALYSIS_TICKET_CHOICES, default=PENDING)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['case_id'], condition=Q(status='IP'), name='unique_ticket_per_case_for_analysis')
        ]

class AnalysisResult(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    parent_ticket = models.ForeignKey(AnalysisTicket, on_delete=models.CASCADE, related_name='results')
    payload = models.JSONField(encoder=DjangoJSONEncoder)

