import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { QuizService } from "../../../services/quiz.service";
import { Spin } from "antd";

const QuizDetail = () => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState(null);
  const fetchQuizDetail = async () => {
    try {
      setIsLoading(true);
      const response = await QuizService.getQuizById(id);
      setData(response);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchQuizDetail();
  }, []);
  console.log({ data });
  return <Spin spinning={isLoading}>ss</Spin>;
};

export default QuizDetail;
