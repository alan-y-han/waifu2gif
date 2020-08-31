import React from "react";
import { createFFmpeg } from "@ffmpeg/ffmpeg";
import "./App.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      videoSrc: "",
      message: "Click Start to transcode",
      startTime: "00:00.000",
      endTime: "04:59.999",
      verticalResolution: "480",
    };
  }

  componentDidMount() {
    document
      .getElementById("fileOpener")
      .addEventListener("change", this.newFileAppeared);

    this.ffmpeg = createFFmpeg({
      log: true,
    });

    this.openedFile = null;
  }

  handleStartTimeChange = (event) => {
    this.setState({
      startTime: event.target.value,
    });
  };

  handleEndTimeChange = (event) => {
    this.setState({
      endTime: event.target.value,
    });
  };

  handleVResChange = (event) => {
    this.setState({
      verticalResolution: event.target.value,
    });
  };

  setMessage = (msg) => {
    this.setState({
      message: msg,
    });
  };

  newFileAppeared = async ({ target: { files } }) => {
    const file = files[0];

    console.log(file.name ? file.name : "No file chosen");

    this.openedFile = file;
  };

  doTranscode = async () => {
    if (!this.openedFile) {
      this.setMessage("No file selected!");
      return;
    }
    this.setMessage("Loading ffmpeg-core.js");
    await this.ffmpeg.load();

    this.setMessage("Start transcoding");

    // const openedFileName = this.openedFile.name;
    const openedFileName = "foo.mkv";

    await this.ffmpeg.write(openedFileName, this.openedFile);
    // await this.ffmpeg.transcode("test.avi", "test.mp4");

    // await this.ffmpeg.run("-i test.mkv -vf subtitles=test.mkv test.gif");
    await this.ffmpeg.run(
      `\
      -ss ${this.state.startTime}\
      -to ${this.state.endTime}\
      -i ${openedFileName}\
      -filter_complex\
        "[0:v]\
        scale=w=${this.state.verticalResolution}:h=-1,\
        split\
          [a][b];\
          [a] palettegen [p];\
          [b][p] paletteuse"\
      test.gif\
      -copyts`
    );

    //      subtitles=ep1.mkv"\

    const data = this.ffmpeg.read("test.gif");
    this.ffmpeg.remove("test.gif");
    this.setState({
      videoSrc: URL.createObjectURL(
        new Blob([data.buffer], { type: "image/gif" })
      ),
    });
    this.setMessage("Complete transcoding");
  };

  render() {
    return (
      <div className="App">
        <p />
        {/* <video src={this.state.videoSrc} controls></video> */}
        <img src={this.state.videoSrc}></img>
        <br />
        <input
          type="text"
          value={this.state.startTime}
          onChange={this.handleStartTimeChange}
        />
        <input
          type="text"
          value={this.state.endTime}
          onChange={this.handleEndTimeChange}
        />
        <input
          type="text"
          value={this.state.verticalResolution}
          onChange={this.handleVResChange}
        />
        <br />
        <input type="file" id="fileOpener" />
        <button onClick={this.doTranscode}>Start</button>
        <p>{this.state.message}</p>
      </div>
    );
  }
}

export default App;
