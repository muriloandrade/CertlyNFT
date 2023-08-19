import "./styles/Home.css";
import {
  Container,
  Grid,
  Box,
  Toolbar,
  IconButton,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput,
  Button
} from '@mui/material';
import BasicTabs from "./components/Tabs";
import CertlyAppBar from "./components/CertlyAppBar";


export default function Home() {
  return (
    <Container fixed >

      <CertlyAppBar />

      <BasicTabs />


    </Container>
  );
}
