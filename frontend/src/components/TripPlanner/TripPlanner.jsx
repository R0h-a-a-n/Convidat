import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Typography, Paper } from '@mui/material';
import TripBudget from './TripBudget';
import TripPackingList from './TripPackingList';
import TripActivities from './TripActivities';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`trip-tabpanel-${index}`}
      aria-labelledby={`trip-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const TripPlanner = ({ tripId }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="trip planner tabs">
          <Tab label="Budget" />
          <Tab label="Packing List" />
          <Tab label="Activities" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <TripBudget tripId={tripId} />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <TripPackingList tripId={tripId} />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <TripActivities tripId={tripId} />
      </TabPanel>
    </Paper>
  );
};

export default TripPlanner; 