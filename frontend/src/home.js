import { useState, useEffect } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { Paper, CardActionArea, CardMedia, Grid, TableContainer, Table, TableBody, TableHead, TableRow, TableCell, Button, CircularProgress } from "@material-ui/core";
import { DropzoneArea } from 'material-ui-dropzone';
import Clear from '@material-ui/icons/Clear';
import axios from "axios";
import image from "./bg.png"; // Import the background image

const ColorButton = withStyles((theme) => ({
  root: {
    color: theme.palette.getContrastText(theme.palette.primary.main),
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}))(Button);

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundImage: `url(${image})`, // Add background image
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    minHeight: '100vh',
  },
  appbar: {
    background: 'transparent', // Set app bar background to transparent
    boxShadow: 'none',
  },
  container: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  media: {
    height: 400,
  },
  dropzoneArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: '300px',
    border: '2px dashed rgba(0, 0, 0, 0.3)',
    borderRadius: theme.spacing(2),
    backgroundColor: '#f5f5f5',
    cursor: 'pointer',
    position: 'relative', // Ensure relative positioning
  },
  dropzoneText: {
    fontSize: '1rem',
    color: theme.palette.text.secondary,
    fontWeight: 'bold',
    margin: theme.spacing(2, 0),
  },
  tableContainer: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
  },
  table: {
    backgroundColor: 'transparent',
  },
  tableHead: {
    backgroundColor: 'transparent',
  },
  tableCell: {
    fontSize: '1rem',
    color: theme.palette.text.secondary,
    fontWeight: 'bold',
    padding: theme.spacing(1, 3),
  },
  button: {
    borderRadius: theme.spacing(2),
    padding: theme.spacing(1, 3),
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.common.white,
    fontWeight: 'bold',
    fontSize: '1rem',
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
    },
    position: 'absolute', // Set absolute positioning
    bottom: '50%', // Align to the middle vertically
    transform: 'translateY(50%)', // Adjust position vertically
    right: '50%', // Align to the middle horizontally
    transform: 'translateX(50%)', // Adjust position horizontally
  },
  title: {
    flexGrow: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '3rem', // Increased font size to 3rem
    color: theme.palette.common.white,
    marginBottom: theme.spacing(4),
  },
  loader: {
    color: theme.palette.secondary.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    marginTop: theme.spacing(2),
  },
}));

export const ImageUpload = () => {
  const classes = useStyles();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [data, setData] = useState(null);
  const [image, setImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [predictedClass, setPredictedClass] = useState("");

  const sendFile = async () => {
    if (image) {
      let formData = new FormData();
      formData.append("file", selectedFile);
      try {
        const res = await axios.post(process.env.REACT_APP_API_URL, formData);
        if (res.status === 200) {
          setData(res.data);
          setPredictedClass(res.data.predicted_class);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }

  const clearData = () => {
    setData(null);
    setImage(false);
    setSelectedFile(null);
    setPreview(null);
  };

  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    if (!preview) {
      return;
    }
    setIsLoading(true);
    sendFile();
  }, [preview]);

  const onSelectFile = (files) => {
    const file = files && files.length > 0 ? files[0] : null;
    setSelectedFile(file);
    setData(null);
    setImage(!!file);
  };

  const confidence = data ? parseFloat(data.confidence * 100).toFixed(2) : 0;

  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.appbar}>
        <Toolbar>
          <Typography className={classes.title} variant="h6" noWrap>
            LeafShield: Plant Disease Classification
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" className={classes.container}>
        <Card>
          <CardContent>
            {image ? (
              <CardActionArea>
                <CardMedia
                  className={classes.media}
                  image={preview}
                  component="image"
                  title="Contemplative Reptile"
                />
              </CardActionArea>
            ) : (
              <DropzoneArea
                acceptedFiles={['image/*']}
                dropzoneText="Drag and drop an image of plant leaf to process"
                onChange={onSelectFile}
                classes={{
                  root: classes.dropzoneArea,
                  text: classes.dropzoneText,
                }}
              />
            )}
            {data && (
              <TableContainer component={Paper} className={classes.tableContainer}>
                <Table className={classes.table} size="small">
                  <TableHead className={classes.tableHead}>
                    <TableRow>
                      <TableCell className={classes.tableCell}>Label:</TableCell>
                      <TableCell align="right" className={classes.tableCell}>Confidence:</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell className={classes.tableCell}>{predictedClass}</TableCell>
                      <TableCell align="right" className={classes.tableCell}>{confidence}%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {isLoading && (
              <div className={classes.loader}>
                <CircularProgress color="secondary" />
                <Typography variant="h6" className={classes.title}>
                  Processing
                </Typography>
              </div>
            )}
          </CardContent>
        </Card>
        {data && (
          <Grid container justifyContent="center" alignItems="center">
            <Grid item>
              <Button variant="contained" className={classes.button} onClick={clearData} startIcon={<Clear />}>
                Clear
              </Button>
            </Grid>
          </Grid>
        )}
      </Container>
    </div>
  );
};

export default ImageUpload;
