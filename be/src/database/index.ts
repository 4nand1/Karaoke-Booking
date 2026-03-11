import { connect } from "mongoose";

export const connectToDatabase = async () => {
  await connect(
    "mongodb+srv://admin:Tsahim6@karaoke.48z7n0c.mongodb.net/?appName=Karaoke"
  );
};
