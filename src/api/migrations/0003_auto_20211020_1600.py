# Generated by Django 3.2.8 on 2021-10-20 16:00

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_analysisresult'),
    ]

    operations = [
        migrations.AddField(
            model_name='analysisticket',
            name='task_id',
            field=models.UUIDField(default=0, editable=False),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='analysisresult',
            name='parent_ticket',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='results', to='api.analysisticket'),
        ),
    ]
