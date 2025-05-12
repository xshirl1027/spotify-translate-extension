import React from "react";
import styles from "./lyricsBar.module.css";
import { Translate } from "@google-cloud/translate";
const projectId = "spotify-translate-459619";
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
    return [timestamp, translatedLine];
  });

  if (currentLyrics === undefined || currentLyrics.length === 0) {
    return <></>;
  }
  return (
    <div className={styles.lyricsBar}>
      {translatedLyrics.map(([timestamp, line]) => (
        <div key={line.id} className={styles.lyricsLine}>
          <p>{line !== "" ? line : "♪  ... ♪"}</p>
        </div>
      ))}
    </div>
  );
};

export default LyricsBar;
