import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import * as React from 'react';

import FinalConsumer from '../pages/FinalConsumer';
import Manufacturer from '../pages/Manufacturer';
import Retailer from '../pages/Retailer';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 2, pt: 8 }}>
            {children}
          </Box>
        )}
      </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const [value, setValue] = React.useState(2);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Manufacturer" {...a11yProps(0)} />
          <Tab label="Retailer" {...a11yProps(1)} />
          <Tab label="Final Consumer" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Manufacturer />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Retailer />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <FinalConsumer />
      </CustomTabPanel>
    </Box>
  );
}