import React, { useEffect, useState } from "react";
import { useStateProviderValue } from "./StateProvider";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import RepeatIcon from "@mui/icons-material/Repeat";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import "./Footer.css";
import { Grid, Slider } from "@mui/material";

function Footer({ spotify }) {
  const [{ item, playing }, dispatch] = useStateProviderValue();
  const [volume, setVolume] = useState(50);
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  useEffect(() => {
    spotify.getMyCurrentPlaybackState().then((r) => {
      console.log(r);

      dispatch({
        type: "SET_PLAYING",
        playing: r.is_playing,
      });

      dispatch({
        type: "SET_ITEM",
        item: r.item,
      });
    });
  }, [spotify, dispatch]);

  const handlePlayPause = () => {
    if (playing) {
      spotify.pause();
      dispatch({
        type: "SET_PLAYING",
        playing: false,
      });
    } else {
      spotify.play();
      dispatch({
        type: "SET_PLAYING",
        playing: true,
      });
    }
  };

  const skipNext = () => {
    spotify
      .skipToNext()
      .then(() => {
        setTimeout(() => {
          spotify
            .getMyCurrentPlayingTrack()
            .then((response) => {
              console.log("Response from getMyCurrentPlayingTrack:", response);
              updateCurrentTrack(response);
            })
            .catch((error) => {
              console.error("Error getting current playing track:", error);
            });
        }, 500);
      })
      .catch((error) => {
        console.error("Error skipping to next track:", error);
      });
  };

  const skipPrevious = () => {
    spotify
      .skipToPrevious()
      .then(() => {
        setTimeout(() => {
          spotify
            .getMyCurrentPlayingTrack()
            .then((response) => {
              console.log("Response from getMyCurrentPlayingTrack:", response);
              updateCurrentTrack(response);
            })
            .catch((error) => {
              console.error("Error getting current playing track:", error);
            });
        }, 500);
      })
      .catch((error) => {
        console.error("Error skipping to previous track:", error);
      });
  };

  const updateCurrentTrack = (data) => {
    if (data && data.item) {
      dispatch({
        type: "SET_ITEM",
        item: data.item,
      });
      dispatch({
        type: "SET_PLAYING",
        playing: data.is_playing,
      });
    } else {
      console.error("Invalid track data received:", data);
    }
  };

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      spotify.setVolume(Math.round(newValue)).catch((error) => {
        console.error("Error setting volume:", error);
      });
    }, 300);

    setDebounceTimeout(timeout);
  };

  return (
    <div className="footer">
      <div className="footer__left">
        <img
          className="footer__albumLogo"
          src={item?.album.images[0].url}
          alt={item?.name}
        />
        {item ? (
          <div className="footer__songInfo">
            <h4>{item.name}</h4>
            <p>{item.artists.map((artist) => artist.name).join(", ")}</p>
          </div>
        ) : (
          <div className="footer__songInfo">
            <h4>No song is playing</h4>
            <p>...</p>
          </div>
        )}
      </div>

      <div className="footer__center">
        <ShuffleIcon className="footer__green" />
        <SkipPreviousIcon onClick={skipPrevious} className="footer__icon" />
        {playing ? (
          <PauseCircleOutlineIcon
            onClick={handlePlayPause}
            fontSize="large"
            className="footer__icon"
          />
        ) : (
          <PlayCircleOutlineIcon
            onClick={handlePlayPause}
            fontSize="large"
            className="footer__icon"
          />
        )}
        <SkipNextIcon onClick={skipNext} className="footer__icon" />
        <RepeatIcon className="footer__green" />
      </div>

      <div className="footer__right">
        <Grid container spacing={2}>
          <Grid item>
            <PlaylistPlayIcon />
          </Grid>
          <Grid item>
            <VolumeDownIcon />
          </Grid>
          <Grid item xs>
            <Slider
              aria-labelledby="continuous-slider"
              min={0}
              max={100}
              value={volume}
              onChange={handleVolumeChange}
            />
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default Footer;
