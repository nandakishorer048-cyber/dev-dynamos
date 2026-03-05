import type { LiveVitals } from '@/hooks/useSmartDevices';

// ──────────────────────────────────────────────
// Health Score
// ──────────────────────────────────────────────

/**
 * Calculate an overall health score (0 – 100) from the latest vitals.
 * Each vital contributes a weighted sub-score.
 */
export function calculateHealthScore(v: LiveVitals): number {
    let totalWeight = 0;
    let weightedSum = 0;

    const add = (score: number, weight: number) => {
        totalWeight += weight;
        weightedSum += score * weight;
    };

    // Heart rate (60–100 normal)
    if (v.heartRate !== null) {
        let s = 100;
        if (v.heartRate < 50) s = 40;
        else if (v.heartRate < 60) s = 70;
        else if (v.heartRate <= 100) s = 100;
        else if (v.heartRate <= 110) s = 75;
        else if (v.heartRate <= 120) s = 55;
        else s = 30;
        add(s, 20);
    }

    // SpO2 (≥95 normal)
    if (v.spo2 !== null) {
        let s = 100;
        if (v.spo2 >= 97) s = 100;
        else if (v.spo2 >= 95) s = 90;
        else if (v.spo2 >= 92) s = 60;
        else if (v.spo2 >= 90) s = 40;
        else s = 20;
        add(s, 20);
    }

    // Blood pressure
    if (v.systolicBp !== null && v.diastolicBp !== null) {
        let s = 100;
        if (v.systolicBp < 120 && v.diastolicBp < 80) s = 100;
        else if (v.systolicBp < 130 && v.diastolicBp < 85) s = 85;
        else if (v.systolicBp < 140 && v.diastolicBp < 90) s = 65;
        else if (v.systolicBp < 160 || v.diastolicBp < 100) s = 40;
        else s = 20;
        add(s, 20);
    }

    // Blood sugar (fasting 70–100 normal)
    if (v.bloodSugar !== null) {
        let s = 100;
        if (v.bloodSugar >= 70 && v.bloodSugar < 100) s = 100;
        else if (v.bloodSugar >= 100 && v.bloodSugar < 126) s = 70;
        else if (v.bloodSugar >= 126 && v.bloodSugar < 180) s = 45;
        else if (v.bloodSugar >= 180) s = 25;
        else if (v.bloodSugar < 70) s = 40;
        add(s, 15);
    }

    // Temperature (36.1–37.2 normal)
    if (v.temperature !== null) {
        let s = 100;
        if (v.temperature >= 36.1 && v.temperature <= 37.2) s = 100;
        else if (v.temperature > 37.2 && v.temperature <= 37.8) s = 75;
        else if (v.temperature > 37.8 && v.temperature <= 38.5) s = 50;
        else if (v.temperature > 38.5) s = 25;
        else s = 60;
        add(s, 10);
    }

    // Steps (goal 8000)
    if (v.steps !== null) {
        const s = Math.min(100, Math.round((v.steps / 8000) * 100));
        add(s, 8);
    }

    // Sleep (7-9h ideal)
    if (v.sleepHours !== null) {
        let s = 100;
        if (v.sleepHours >= 7 && v.sleepHours <= 9) s = 100;
        else if (v.sleepHours >= 6) s = 75;
        else if (v.sleepHours >= 5) s = 50;
        else s = 30;
        add(s, 7);
    }

    if (totalWeight === 0) return 0;
    return Math.round(weightedSum / totalWeight);
}

// ──────────────────────────────────────────────
// AI Insights
// ──────────────────────────────────────────────

export type InsightSeverity = 'success' | 'info' | 'warning' | 'danger';

export interface HealthInsight {
    id: string;
    severity: InsightSeverity;
    title: string;
    message: string;
    icon: string;     // Lucide icon name
}

export function getAIInsights(v: LiveVitals): HealthInsight[] {
    const insights: HealthInsight[] = [];

    // Heart rate
    if (v.heartRate !== null) {
        if (v.heartRate > 110) {
            insights.push({
                id: 'hr-high',
                severity: 'warning',
                title: 'Elevated Heart Rate',
                message: `Your heart rate is ${v.heartRate} bpm which is higher than normal. Consider resting and staying hydrated.`,
                icon: 'Heart',
            });
        } else if (v.heartRate > 120) {
            insights.push({
                id: 'hr-danger',
                severity: 'danger',
                title: 'High Heart Rate Alert',
                message: `Heart rate at ${v.heartRate} bpm is significantly elevated. If this persists, consult your doctor.`,
                icon: 'Heart',
            });
        } else if (v.heartRate < 55) {
            insights.push({
                id: 'hr-low',
                severity: 'info',
                title: 'Low Heart Rate',
                message: `Heart rate is ${v.heartRate} bpm. This may be normal for athletes, but consult a doctor if you feel dizzy.`,
                icon: 'Heart',
            });
        } else if (v.heartRate >= 60 && v.heartRate <= 80) {
            insights.push({
                id: 'hr-ok',
                severity: 'success',
                title: 'Heart Rate Normal',
                message: `Your heart rate of ${v.heartRate} bpm is in the optimal range. Keep it up!`,
                icon: 'Heart',
            });
        }
    }

    // SpO2
    if (v.spo2 !== null) {
        if (v.spo2 < 90) {
            insights.push({
                id: 'spo2-critical',
                severity: 'danger',
                title: 'Critical Oxygen Level',
                message: `Oxygen level at ${v.spo2}% is critically low. Seek immediate medical attention.`,
                icon: 'Wind',
            });
        } else if (v.spo2 < 94) {
            insights.push({
                id: 'spo2-low',
                severity: 'warning',
                title: 'Low Oxygen Level',
                message: `Oxygen level at ${v.spo2}% is below normal. Monitor closely and rest.`,
                icon: 'Wind',
            });
        } else if (v.spo2 >= 97) {
            insights.push({
                id: 'spo2-ok',
                severity: 'success',
                title: 'Oxygen Level Excellent',
                message: `SpO2 at ${v.spo2}% is excellent. Your blood oxygen is well within the healthy range.`,
                icon: 'Wind',
            });
        }
    }

    // Blood pressure
    if (v.systolicBp !== null && v.diastolicBp !== null) {
        if (v.systolicBp >= 140 || v.diastolicBp >= 90) {
            insights.push({
                id: 'bp-high',
                severity: 'danger',
                title: 'High Blood Pressure',
                message: `BP at ${v.systolicBp}/${v.diastolicBp} mmHg indicates hypertension. Please consult your doctor.`,
                icon: 'Activity',
            });
        } else if (v.systolicBp >= 130 || v.diastolicBp >= 85) {
            insights.push({
                id: 'bp-elevated',
                severity: 'warning',
                title: 'Elevated Blood Pressure',
                message: `BP at ${v.systolicBp}/${v.diastolicBp} mmHg is above optimal. Consider lifestyle changes.`,
                icon: 'Activity',
            });
        } else if (v.systolicBp < 120 && v.diastolicBp < 80) {
            insights.push({
                id: 'bp-ok',
                severity: 'success',
                title: 'Blood Pressure Normal',
                message: `BP at ${v.systolicBp}/${v.diastolicBp} mmHg is in the ideal range. Great job!`,
                icon: 'Activity',
            });
        }
    }

    // Blood sugar
    if (v.bloodSugar !== null) {
        if (v.bloodSugar >= 180) {
            insights.push({
                id: 'sugar-high',
                severity: 'danger',
                title: 'Very High Blood Sugar',
                message: `Blood sugar at ${v.bloodSugar} mg/dL is very high. Consult your healthcare provider immediately.`,
                icon: 'Droplets',
            });
        } else if (v.bloodSugar >= 126) {
            insights.push({
                id: 'sugar-elevated',
                severity: 'warning',
                title: 'Elevated Blood Sugar',
                message: `Blood sugar at ${v.bloodSugar} mg/dL indicates diabetic range. Monitor closely and consult your doctor.`,
                icon: 'Droplets',
            });
        } else if (v.bloodSugar < 70) {
            insights.push({
                id: 'sugar-low',
                severity: 'warning',
                title: 'Low Blood Sugar',
                message: `Blood sugar at ${v.bloodSugar} mg/dL is low. Have a snack with fast-acting carbs.`,
                icon: 'Droplets',
            });
        }
    }

    // Temperature
    if (v.temperature !== null) {
        if (v.temperature > 38.5) {
            insights.push({
                id: 'temp-fever',
                severity: 'danger',
                title: 'High Fever Detected',
                message: `Temperature at ${v.temperature}°C indicates a high fever. Rest, hydrate, and consult a doctor.`,
                icon: 'Thermometer',
            });
        } else if (v.temperature > 37.5) {
            insights.push({
                id: 'temp-mild',
                severity: 'warning',
                title: 'Mild Fever',
                message: `Temperature at ${v.temperature}°C is slightly elevated. Monitor your symptoms.`,
                icon: 'Thermometer',
            });
        }
    }

    // Stress
    if (v.stressLevel !== null && v.stressLevel >= 7) {
        insights.push({
            id: 'stress-high',
            severity: 'warning',
            title: 'High Stress Level',
            message: `Stress level is ${v.stressLevel}/10. Try deep breathing exercises or a short walk.`,
            icon: 'Brain',
        });
    }

    // If nothing concerning, add a general positive
    if (insights.length === 0 && (v.heartRate !== null || v.spo2 !== null)) {
        insights.push({
            id: 'all-good',
            severity: 'success',
            title: 'Looking Great!',
            message: 'All monitored vitals are within healthy ranges. Keep maintaining your healthy lifestyle!',
            icon: 'Sparkles',
        });
    }

    return insights;
}

// ──────────────────────────────────────────────
// Device type labels
// ──────────────────────────────────────────────

export function deviceTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        smartwatch: 'Smart Watch',
        fitness_band: 'Fitness Band',
        bp_monitor: 'BP Monitor',
        pulse_oximeter: 'Pulse Oximeter',
        glucose_meter: 'Glucose Meter',
    };
    return labels[type] || type;
}
