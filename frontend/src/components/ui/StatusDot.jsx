import React from 'react';

const StatusDot = ({ status }) => {
  let bgColor = "bg-gray-400"; // Default for offline or unknown
  if (status === "online") bgColor = "bg-green-500";
  else if (status === "away") bgColor = "bg-yellow-500";
  else if (status === "busy") bgColor = "bg-red-500";

  return <span className={`w-2.5 h-2.5 ${bgColor} rounded-full inline-block`} />;
};

export default StatusDot;
