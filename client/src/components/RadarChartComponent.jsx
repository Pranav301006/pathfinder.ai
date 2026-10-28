import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

export default function RadarChartComponent({ verifiedSkills = {}, requiredSkills = {} }) {
  // Combine skills into a single dataset for radar chart
  const skillNames = Array.from(new Set([
    ...Object.keys(requiredSkills),
    ...Object.keys(verifiedSkills)
  ]));

  const data = skillNames.map(name => {
    // Shorten label for cleaner mobile display
    const shortLabel = name.split('&')[0].trim();
    return {
      subject: shortLabel,
      fullName: name,
      'Your Verified Skill': verifiedSkills[name] !== undefined ? verifiedSkills[name] : 2.5,
      'Career Requirement': requiredSkills[name] !== undefined ? requiredSkills[name] : 3.0,
      fullMark: 5
    };
  });

  return (
    <div style={{ width: '100%', height: 320, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="rgba(255, 255, 255, 0.15)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 5]}
            tick={{ fill: '#64748b', fontSize: 10 }}
          />
          <Radar
            name="Career Requirement"
            dataKey="Career Requirement"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.25}
          />
          <Radar
            name="Your Verified Skill"
            dataKey="Your Verified Skill"
            stroke="#4f46e5"
            fill="#4f46e5"
            fillOpacity={0.5}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '12px'
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
