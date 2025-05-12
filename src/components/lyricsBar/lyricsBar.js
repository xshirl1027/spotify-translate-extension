import React from "react";
import styles from "./lyricsBar.module.css";
import { Translate } from "@google-cloud/translate";
const translateLine = async (text, targetLanguage) => {
  const translate = new Translate({ projectId });
  try {
    const [translation] = await translate.translate(text, targetLanguage);
    return translation;
  } catch (error) {
    console.error("Error translating text:", error);
    return text; // Fallback to original text in case of error
  }
};
const LyricsBar = ({ currentLyrics }) => {
  const translatedLyrics = currentLyrics.map(async ([timestamp, line]) => {
    const translatedLine = await translateLine(line, "fr");
    if (translatedLine) {
      console.log(translatedLine);
    }
    return [timestamp, line];
  });

  if (currentLyrics === undefined || currentLyrics.length === 0) {
    return <></>;
  }
  return (
    <div className={styles.lyricsBar}>
      {currentLyrics.map(([timestamp, line]) => (
        <div key={line.id} className={styles.lyricsLine}>
          <p>{line !== "" ? line : "♪  ... ♪"}</p>
        </div>
      ))}
    </div>
  );
};

export default LyricsBar;
