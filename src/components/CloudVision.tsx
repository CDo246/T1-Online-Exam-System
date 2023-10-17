import axios from "axios";
import { request } from "http";

class CloudVision {
  constructor() {
    this.labels = [];
  }

  labels: string[];

  setLabels(labels: string[]) {
    this.labels = labels;
  }

  async analyseImage(base64ImageData: string) {
    console.log("attempting to analyse screenshot");
    try {
      //Replace with Key
      const apiKey = "";
      const apiURL = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
      const base64Trimmed = base64ImageData.slice(23);

      const requestData = {
        requests: [
          {
            image: {
              content: base64Trimmed,
            },
            features: [
              {
                type: "LABEL_DETECTION",
                maxResults: 10,
              },
            ],
          },
        ],
      };

      const apiResponse = await axios.post(apiURL, requestData);
      this.setLabels(apiResponse.data.responses[0].labelAnnotations);
    } catch (error) {
      console.error("Error performing cloud vision analysis: ", error);
      alert(error);
    }
    console.log("screenshot analysed");
    return this.labels;
  }
}

export default CloudVision;
