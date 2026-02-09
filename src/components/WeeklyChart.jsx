
import React from 'react';

export default function WeeklyChart({ data, color }) {
    // data is array of objects: { label: string, points: number, isCurrent: boolean }
    // Represents rolling 6 weeks.

    if (!data || data.length === 0) {
        return null; // Or empty state
    }

    // Determine max value for Y-axis scaling
    // Add some padding (e.g., 20% more space) so the highest bar isn't touching top
    const maxPoints = Math.max(...data.map(d => d.points), 10); // Minimum 10 scale
    const scaleMax = Math.ceil(maxPoints * 1.2);

    return (
        <div style={{ marginTop: '25px', padding: '0 5px' }}>
            <h5 style={{
                margin: '0 0 15px 0',
                color: '#888',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '1px'
            }}>
                Weekly Points History
            </h5>

            <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                height: '140px',
                gap: '8px'
            }}>
                {data.map((week, idx) => {
                    const heightPercent = Math.max(2, (week.points / scaleMax) * 100); // Min 2% height so bar is visible
                    const isZero = week.points === 0;

                    return (
                        <div key={idx} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            flex: 1,
                            height: '100%',
                            position: 'relative'
                        }}>
                            {/* Bar Container */}
                            <div style={{
                                flex: 1,
                                width: '100%',
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'center',
                                paddingBottom: '6px'
                            }}>
                                <div style={{
                                    width: '70%',
                                    maxWidth: '24px',
                                    height: `${heightPercent}%`,
                                    background: isZero ? '#f0f0f0' : (week.isCurrent ? color : `${color}88`), // Current week is full color, past are faded
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    position: 'relative'
                                }} title={`${week.label}: ${week.points} pts`}>

                                    {/* Number on top if > 0 */}
                                    {!isZero && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '-20px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold',
                                            color: week.isCurrent ? '#333' : '#999'
                                        }}>
                                            {week.points}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* X-axis Label */}
                            <div style={{
                                fontSize: '0.65rem',
                                color: week.isCurrent ? '#333' : '#aaa',
                                fontWeight: week.isCurrent ? 'bold' : 'normal',
                                textAlign: 'center',
                                lineHeight: '1.2'
                            }}>
                                {week.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
