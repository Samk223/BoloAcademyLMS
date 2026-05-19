"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import AgoraRTC from "agora-rtc-sdk-ng";
import { MessageCircle, Send, ThumbsUp, BarChart3, X } from "lucide-react";
import { brutalBorder, brutalShadow, brutalShadowSm, brutalHover } from "../../utils/theme";

export default function StudentLiveClass({ roomId, userName, userId }) {
  const channelName = useMemo(() => `liveclass.${roomId}`, [roomId]);
  const [connected] = useState(Boolean(window?.Echo));

  const [messages, setMessages] = useState([]);
  const [chatText, setChatText] = useState("");

  const [reactionBurst, setReactionBurst] = useState(null);

  const [activePoll, setActivePoll] = useState(null);
  const [pollVoters, setPollVoters] = useState({});
  const [pollClosed, setPollClosed] = useState(false);
  const [votedPolls, setVotedPolls] = useState({});

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [resultsReleased, setResultsReleased] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [storedQuiz, setStoredQuiz] = useState(null);
  const [isBannedByTeacher, setIsBannedByTeacher] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(message) {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }
  const [rtcStatus, setRtcStatus] = useState("Waiting for teacher");
  const [mediaError, setMediaError] = useState("");
  const [hasTeacherVideo, setHasTeacherVideo] = useState(false);

  const chatEndRef = useRef(null);
  const videoMountRef = useRef(null);
  const agoraClientRef = useRef(null);
  const joiningRef = useRef(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    const echo = window?.Echo;
    if (!echo) return;

    const channel = echo.private(channelName);
    channel
      .listen(".live.chat.message", (e) => setMessages((prev) => [...prev, e.message]))
      .listen(".live.reaction", (e) => {
        setReactionBurst(e.reaction);
        window.setTimeout(() => setReactionBurst(null), 1500);
      })
      .listen(".live.poll.created", (e) => {
        setActivePoll(e.poll);
        setPollVoters({});
        setPollClosed(false);
        showToast("New poll received! 📊");
      })
      .listen(".live.poll.voted", (e) => {
        setPollVoters((prev) => {
          const voterId = e.vote.user?.id;
          if (!voterId || prev[voterId]) return prev;

          return { ...prev, [voterId]: e.vote.optionId };
        });
      })
      .listen(".live.poll.closed", (e) => {
        setActivePoll((prev) => {
          if (prev?.id === e.poll?.id) setPollClosed(true);
          return prev;
        });
        if (e.poll && e.poll.results) {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === "poll-result-" + e.poll.id);
            if (exists) return prev;
            return [
              ...prev,
              {
                id: "poll-result-" + e.poll.id,
                system: true,
                isPollResult: true,
                poll: e.poll,
              },
            ];
          });
          showToast("Poll closed & results shared! 📊");
        }
      })
      .listen(".live.quiz.sent", (e) => {
        setActiveQuiz(e.quiz);
        setStoredQuiz(e.quiz);
        setQuizAnswers({});
        setQuizSubmitted(false);
        setResultsReleased(false);
        setLeaderboard([]);
        showToast("New quiz received! 🦉");
      })
      .listen(".live.quiz.results_broadcasted", (e) => {
        if (e.results) {
          setLeaderboard(e.results.leaderboard || []);
          setResultsReleased(true);
          setStoredQuiz((currQuiz) => {
            if (currQuiz) {
              setActiveQuiz(currQuiz);
            }
            return currQuiz;
          });
          showToast("Quiz results released! 🏆");
        }
      })
      .listen(".live.student.kicked", (e) => {
        if (String(e.userId) === String(userId)) {
          setIsBannedByTeacher(true);
          try {
            agoraClientRef.current?.leave();
          } catch (err) {
            // ignore
          }
        }
      });

    return () => {
      try {
        echo.leave(channelName);
      } catch {
        // ignore
      }
    };
  }, [channelName]);

  useEffect(() => {
    if (isBannedByTeacher) return;

    async function sendPing() {
      try {
        const res = await axios.post(`/api/live/${roomId}/ping`);
        if (res.data?.banned) {
          setIsBannedByTeacher(true);
          try {
            agoraClientRef.current?.leave();
          } catch (err) {
            // ignore
          }
        }
      } catch (err) {
        console.error("Heartbeat ping failed:", err);
      }
    }

    sendPing();
    const interval = setInterval(sendPing, 5000);

    return () => clearInterval(interval);
  }, [roomId, isBannedByTeacher]);

  useEffect(() => {
    let cancelled = false;

    async function joinAgoraAsAudience() {
      if (joiningRef.current || agoraClientRef.current) return;
      joiningRef.current = true;
      setMediaError("");

      try {
        const res = await axios.post(`/api/live/${roomId}/agora/token`, { role: "subscriber" });
        if (cancelled) {
          joiningRef.current = false;
          return;
        }

        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

        const clearVideoMount = () => {
          videoMountRef.current?.replaceChildren();
        };

        const subscribeToUser = async (user, mediaType) => {
          await client.subscribe(user, mediaType);

          if (mediaType === "video" && user.videoTrack && videoMountRef.current) {
            clearVideoMount();
            setHasTeacherVideo(true);
            setRtcStatus("Teacher live");
            user.videoTrack.play(videoMountRef.current);
          }

          if (mediaType === "audio" && user.audioTrack) {
            user.audioTrack.play();
          }
        };

        client.on("user-published", async (user, mediaType) => {
          await subscribeToUser(user, mediaType);
        });

        client.on("user-unpublished", (_user, mediaType) => {
          if (mediaType === "video") {
            setHasTeacherVideo(false);
            setRtcStatus("Teacher video stopped");
            clearVideoMount();
          }
        });

        client.on("user-left", () => {
          setHasTeacherVideo(false);
          setRtcStatus("Teacher left");
          clearVideoMount();
        });

        await client.join(res.data.appId, res.data.channel, res.data.token, res.data.uid);

        if (cancelled) {
          client.leave().catch(() => {});
          joiningRef.current = false;
          return;
        }

        agoraClientRef.current = client;

        await Promise.all(
          client.remoteUsers.flatMap((user) => {
            const subscriptions = [];
            if (user.hasVideo) subscriptions.push(subscribeToUser(user, "video"));
            if (user.hasAudio) subscriptions.push(subscribeToUser(user, "audio"));
            return subscriptions;
          })
        );
        if (!cancelled && !client.remoteUsers.some((user) => user.hasVideo)) {
          setRtcStatus("Connected, waiting for teacher");
        }
      } catch (error) {
        if (!cancelled) {
          setMediaError(error?.message || "Could not join live stream.");
          setRtcStatus("Failed");
        }
      } finally {
        joiningRef.current = false;
      }
    }

    joinAgoraAsAudience();

    return () => {
      cancelled = true;
      const client = agoraClientRef.current;
      agoraClientRef.current = null;
      if (client) {
        client.leave().catch(() => {});
      }
    };
  }, [roomId]);

  async function sendChat() {
    const text = chatText.trim();
    if (!text) return;

    setChatText("");
    const res = await axios.post(`/api/live/${roomId}/chat`, { text });
    if (res?.data?.message) setMessages((prev) => [...prev, res.data.message]);
  }

  async function vote(optionId) {
    if (!activePoll || pollClosed || votedPolls[activePoll.id]) return;

    try {
      await axios.post(`/api/live/${roomId}/polls/vote`, { pollId: activePoll.id, optionId });
      setVotedPolls((prev) => ({ ...prev, [activePoll.id]: optionId }));
      setPollVoters((prev) => ({ ...prev, [String(userId)]: optionId }));
      showToast("Vote submitted! 🗳️");
    } catch (err) {
      console.error("Failed to vote:", err);
      showToast("Failed to submit vote ❌");
    }
  }

  function pickAnswer(qId, optionId) {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qId]: optionId }));
  }

  async function submitQuiz() {
    if (!activeQuiz || quizSubmitted) return;

    let correct = 0;
    const total = activeQuiz.questions?.length || 0;

    activeQuiz.questions?.forEach((q) => {
      if (quizAnswers[q.id] === q.answerId) {
        correct++;
      }
    });

    try {
      await axios.post(`/api/live/${roomId}/quiz/submit`, {
        quizId: activeQuiz.id,
        studentName: userName || "Student",
        score: { correct, total }
      });
      setQuizSubmitted(true);
      setActiveQuiz(null);
      showToast("Quiz submitted successfully! 🎉");
    } catch (e) {
      console.error("Failed to submit quiz answers:", e);
      showToast("Failed to submit quiz ❌");
    }
  }

  const pollVotes = Object.values(pollVoters).reduce((totals, optionId) => {
    totals[optionId] = (totals[optionId] || 0) + 1;
    return totals;
  }, {});

  if (isBannedByTeacher) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FADBD8] text-[#1E1E1E] p-6">
        <div className={`w-full max-w-lg bg-white rounded-[2.5rem] p-8 text-center ${brutalBorder} shadow-[12px_12px_0px_0px_#1E1E1E]`}>
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-3xl font-black text-red-600">Access Denied</h2>
          <p className="font-bold text-gray-700 mt-4 leading-relaxed">
            You have been removed and banned from this live class by the teacher. Please contact support or your tutor for more details.
          </p>
          <a
            href="/dashboard"
            className={`inline-block mt-8 px-6 py-4 bg-[#1E1E1E] text-white rounded-2xl font-black uppercase text-sm ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head title="Live Class (Student)" />
      <div className="h-screen overflow-y-auto bg-[#FFF8E7] text-[#1E1E1E] p-6 lg:p-10">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-3xl font-black">Live Class</div>
              <div className="font-bold text-gray-600">
                Student: {userName} • Room: <span className="font-black">{roomId}</span>{" "}
                {!connected && <span className="ml-2 text-red-600">Realtime not configured</span>}
              </div>
            </div>
            <Link
              href={route("dashboard")}
              className={`px-4 py-3 bg-white rounded-2xl font-black ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}
            >
              Back
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-2 bg-white rounded-[2.5rem] p-6 ${brutalBorder} ${brutalShadow} space-y-5`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="text-2xl font-black">Teacher Stream (Agora goes here)</div>
                {reactionBurst && (
                  <div className={`px-4 py-2 bg-[#D1F2EB] rounded-full ${brutalBorder} ${brutalShadowSm} font-black`}>
                    {reactionBurst.emoji} {reactionBurst.user?.name}
                  </div>
                )}
              </div>

              <div
                className={`relative h-[360px] bg-[#FFF8E7] rounded-[2rem] ${brutalBorder} overflow-hidden flex items-center justify-center`}
              >
                <div
                  ref={videoMountRef}
                  className="absolute inset-0 [&_video]:!w-full [&_video]:!h-full [&_video]:!object-cover"
                />
                {!hasTeacherVideo && (
                  <div className="relative z-10 text-center max-w-md px-6">
                    <div className="text-5xl mb-4">📺</div>
                    <div className="text-xl font-black">Video will render here</div>
                    <div className="font-bold text-gray-600 mt-2">
                      {rtcStatus}
                    </div>
                    {mediaError && <div className="font-bold text-red-600 mt-2">{mediaError}</div>}
                  </div>
                )}
              </div>

              {activePoll && (
                <div className={`bg-[#FEF08A] rounded-[2rem] p-5 ${brutalBorder} ${brutalShadowSm}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-black text-xl flex items-center gap-2">
                      <BarChart3 size={20} strokeWidth={3} /> Live Poll
                    </div>
                    <button
                      onClick={() => setActivePoll(null)}
                      className={`px-3 py-2 bg-white rounded-xl font-black ${brutalBorder} ${brutalShadowSm} ${brutalHover} flex items-center gap-2`}
                    >
                      <X size={16} strokeWidth={3} /> Hide
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="font-black">{activePoll.question}</div>
                    <div className={`px-3 py-1 rounded-full text-xs font-black ${brutalBorder} ${pollClosed ? "bg-gray-100" : "bg-[#D1F2EB]"}`}>
                      {pollClosed ? "Closed" : votedPolls[activePoll.id] ? "Voted" : "Open"}
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {activePoll.options?.map((o) => {
                      const selected = votedPolls[activePoll.id] === o.id;
                      const disabled = pollClosed || Boolean(votedPolls[activePoll.id]);
                      return (
                      <button
                        key={o.id}
                        onClick={() => vote(o.id)}
                        disabled={disabled}
                        className={`rounded-2xl p-3 ${brutalBorder} ${brutalShadowSm} flex items-center justify-between ${
                          selected ? "bg-[#D1F2EB]" : "bg-white"
                        } ${disabled ? "opacity-80" : brutalHover}`}
                      >
                        <span className="font-bold">{o.label}</span>
                        <span className="font-black">{pollVotes[o.id] || 0}</span>
                      </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeQuiz && (
                <div className={`bg-[#E9D5FF] rounded-[2rem] p-5 ${brutalBorder} ${brutalShadowSm}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-black text-xl flex items-center gap-2">🦉 {activeQuiz.title}</div>
                    <button
                      onClick={() => setActiveQuiz(null)}
                      className={`px-3 py-2 bg-white rounded-xl font-black ${brutalBorder} ${brutalShadowSm} ${brutalHover} flex items-center gap-2`}
                    >
                      <X size={16} strokeWidth={3} /> Hide
                    </button>
                  </div>
                  <div className="mt-1 font-bold text-gray-700">{activeQuiz.topic} Session</div>
                  
                  {resultsReleased ? (
                    <div className="mt-4 space-y-4">
                      {/* Score Summary Banner */}
                      <div className={`bg-[#D1F2EB] rounded-2xl p-5 ${brutalBorder} text-center`}>
                        <div className="text-sm font-black uppercase text-gray-600">Your Final Score</div>
                        <h3 className="text-4xl font-black mt-1">
                          {activeQuiz.questions?.filter(q => quizAnswers[q.id] === q.answerId).length} / {activeQuiz.questions?.length} Correct!
                        </h3>
                        <p className="font-bold text-gray-700 text-sm mt-1">
                          {activeQuiz.questions?.filter(q => quizAnswers[q.id] === q.answerId).length === activeQuiz.questions?.length 
                            ? "🏆 Absolute Genius! Perfect Score!" 
                            : "🌟 Superb effort! Keep learning!"}
                        </p>
                      </div>

                      {/* Leaderboard Panel */}
                      {leaderboard.length > 0 && (
                        <div className={`bg-white rounded-2xl p-5 ${brutalBorder}`}>
                          <div className="font-black text-lg mb-3 flex items-center gap-2">🏆 Live Leaderboard</div>
                          <div className="space-y-2">
                            {leaderboard
                              .sort((a, b) => b.score.correct - a.score.correct)
                              .map((item, idx) => (
                                <div key={idx} className={`flex items-center justify-between p-3 rounded-xl ${brutalBorder} ${
                                  item.studentName === auth?.user?.name ? 'bg-[#FFE5D9]' : 'bg-[#FFF8E7]'
                                }`}>
                                  <div className="flex items-center gap-2">
                                    <span className="font-black text-sm">#{idx + 1}</span>
                                    <span className="font-black">{item.studentName}</span>
                                    {item.studentName === auth?.user?.name && <span className="text-xs bg-[#D1F2EB] px-2 py-0.5 rounded-full font-black border border-black">You</span>}
                                  </div>
                                  <span className="font-black bg-white px-3 py-1 rounded-lg border-2 border-black">
                                    {item.score.correct} / {item.score.total}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Answer Key Details */}
                      <div className="space-y-4">
                        <div className="font-black text-lg">Detailed Review</div>
                        {activeQuiz.questions?.map((q, idx) => {
                          const studentAns = quizAnswers[q.id];
                          const isCorrect = studentAns === q.answerId;
                          return (
                            <div key={q.id || idx} className={`bg-white rounded-2xl p-4 ${brutalBorder} border-t-[6px] ${
                              isCorrect ? 'border-t-green-500' : 'border-t-red-500'
                            }`}>
                              <div className="flex justify-between items-start gap-2">
                                <div className="font-black">Q{idx + 1}. {q.q}</div>
                                <span className={`px-2 py-0.5 rounded-md font-black text-xs uppercase border border-black ${
                                  isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                                }`}>
                                  {isCorrect ? 'Correct' : 'Incorrect'}
                                </span>
                              </div>
                              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                                {q.options?.map((o) => {
                                  const wasSelected = studentAns === o.id;
                                  const isOptionCorrect = q.answerId === o.id;
                                  
                                  let bgClass = "bg-[#FFF8E7]";
                                  let borderClass = brutalBorder;
                                  if (isOptionCorrect) {
                                    bgClass = "bg-green-100 text-green-800";
                                    borderClass = "border-2 border-green-600";
                                  } else if (wasSelected && !isCorrect) {
                                    bgClass = "bg-red-100 text-red-800";
                                    borderClass = "border-2 border-red-600";
                                  }

                                  return (
                                    <div
                                      key={o.id}
                                      className={`rounded-xl p-3 ${borderClass} font-bold text-left ${bgClass} flex items-center justify-between`}
                                    >
                                      <span>{o.text}</span>
                                      {isOptionCorrect && <span className="text-green-700 font-black">✓ Correct</span>}
                                      {wasSelected && !isCorrect && <span className="text-red-700 font-black">✗ Your Answer</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : quizSubmitted ? (
                    <div className="mt-6 text-center space-y-4">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto animate-bounce border-3 border-black shadow-[4px_4px_0px_0px_#1E1E1E]">
                        <span className="text-3xl">🎉</span>
                      </div>
                      <h4 className="text-xl font-black uppercase">Answers Submitted!</h4>
                      <p className="font-bold text-gray-600 max-w-sm mx-auto text-sm">
                        Great job! Your responses are recorded. Hang tight — the teacher will broadcast the correct answers and live results shortly!
                      </p>
                      <div className="flex items-center justify-center gap-2 text-xs font-black text-purple-700 bg-white/60 py-2 px-4 rounded-full border border-dashed border-purple-400 max-w-[280px] mx-auto animate-pulse">
                        <div className="w-2.5 h-2.5 bg-purple-600 rounded-full animate-ping"></div>
                        Waiting for results broadcast...
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-4">
                      <div className="space-y-4">
                        {activeQuiz.questions?.map((q, idx) => (
                          <div key={q.id || idx} className={`bg-white rounded-2xl p-4 ${brutalBorder}`}>
                            <div className="font-black">
                              Q{idx + 1}. {q.q}
                            </div>
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                              {q.options?.map((o) => {
                                const selected = quizAnswers[q.id] === o.id;
                                return (
                                  <button
                                    key={o.id}
                                    onClick={() => pickAnswer(q.id, o.id)}
                                    className={`rounded-xl p-3 ${brutalBorder} font-bold text-left ${
                                      selected ? "bg-[#D1F2EB]" : "bg-[#FFF8E7]"
                                    } ${brutalHover}`}
                                  >
                                    {o.text}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="mt-3 flex items-center gap-2 text-sm font-bold text-gray-600">
                              <ThumbsUp size={16} strokeWidth={3} /> Selected:{" "}
                              <span className="font-black text-purple-600">{quizAnswers[q.id] ? "Yes" : "No"}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 flex flex-col items-center gap-3">
                        <div className="text-xs font-black text-gray-600">
                          Progress: {Object.keys(quizAnswers).length} of {activeQuiz.questions?.length || 0} Answered
                        </div>
                        <button
                          onClick={submitQuiz}
                          disabled={Object.keys(quizAnswers).length < (activeQuiz.questions?.length || 0)}
                          className={`w-full py-4 rounded-2xl font-black text-lg uppercase ${
                            Object.keys(quizAnswers).length < (activeQuiz.questions?.length || 0)
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed border-2 border-gray-400"
                              : "bg-[#FFE5D9] text-[#1E1E1E] " + brutalBorder + " " + brutalShadowSm + " " + brutalHover
                          }`}
                        >
                          Submit Answers 🎉
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={`bg-white rounded-[2.5rem] p-6 ${brutalBorder} ${brutalShadow} flex flex-col`}>
              <div className="flex items-center justify-between gap-3">
                <div className="text-2xl font-black flex items-center gap-2">
                  <MessageCircle size={22} strokeWidth={3} /> Chat
                </div>
                <div className="text-xs font-black text-gray-500">{messages.length} msgs</div>
              </div>

              <div className={`mt-4 flex-1 overflow-y-auto bg-[#FFF8E7] rounded-[2rem] ${brutalBorder} p-4`}>
                <div className="space-y-3">
                  {messages.map((m) => {
                    if (m.isPollResult) {
                      const results = m.poll?.results || {};
                      const question = results.question || "Poll question";
                      const options = results.options || [];
                      const votes = results.votes || {};
                      const correctOptionId = results.correctOptionId;
                      
                      const totalVotes = Object.values(votes).reduce((sum, val) => sum + Number(val), 0);

                      return (
                        <div key={m.id} className={`w-full bg-[#FEF08A] rounded-[2rem] p-5 ${brutalBorder} shadow-[4px_4px_0px_0px_#1E1E1E] text-left border-3 border-black`}>
                          <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                            <span className="font-black text-xs uppercase bg-black text-white px-2.5 py-1 rounded-lg">📊 Poll Closed</span>
                            <span className="font-black text-xs text-gray-700">Total Voters: {totalVotes} students</span>
                          </div>
                          
                          <div className="font-black text-sm text-[#1E1E1E] leading-snug mb-3">
                            {question}
                          </div>

                          <div className="space-y-2.5">
                            {options.map((opt) => {
                              const count = votes[opt.id] || 0;
                              const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                              const isCorrect = opt.id === correctOptionId;
                              
                              return (
                                <div key={opt.id} className={`p-3 bg-white rounded-xl ${brutalBorder} relative overflow-hidden flex flex-col gap-1 ${isCorrect ? 'bg-[#E8F8F5] border-green-600 border-2' : ''}`}>
                                  <div 
                                    className={`absolute left-0 top-0 bottom-0 ${isCorrect ? 'bg-[#A3E4D7]/30' : 'bg-gray-100'}`} 
                                    style={{ width: `${percent}%`, zIndex: 0 }} 
                                  />
                                  
                                  <div className="flex items-center justify-between z-10 relative">
                                    <span className="font-black text-xs">{opt.label}</span>
                                    <span className="font-black text-xs bg-white px-2 py-0.5 rounded-md border-2 border-black">
                                      {count} ({percent}%)
                                    </span>
                                  </div>

                                  {isCorrect && (
                                    <div className="z-10 relative flex items-center gap-1 font-black text-[10px] text-green-700 uppercase">
                                      ✓ Correct Answer
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    const mine = String(m.user?.id) === String(userId);
                    return (
                    <div
                      key={m.id}
                      className={`max-w-[85%] rounded-2xl p-3 ${brutalBorder} ${brutalShadowSm} ${
                        mine ? "ml-auto bg-[#D1F2EB] text-right" : "mr-auto bg-white text-left"
                      }`}
                    >
                      <div className="text-xs font-black text-gray-500">{mine ? "You" : m.user?.name}</div>
                      <div className="font-bold whitespace-pre-wrap">{m.text}</div>
                    </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendChat();
                  }}
                  className={`flex-1 px-4 py-3 rounded-2xl bg-white font-bold outline-none ${brutalBorder}`}
                  placeholder="Ask a doubt…"
                />
                <button
                  onClick={sendChat}
                  className={`px-4 py-3 bg-[#1E1E1E] text-white rounded-2xl font-black ${brutalBorder} ${brutalShadowSm} ${brutalHover} flex items-center gap-2`}
                >
                  <Send size={18} strokeWidth={3} /> Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {toast && (
        <div className={`fixed bottom-8 right-8 z-[999] bg-[#D1F2EB] text-[#1E1E1E] border-3 border-black p-4 px-6 rounded-2xl shadow-[6px_6px_0px_0px_#1E1E1E] font-black text-sm flex items-center gap-2 animate-bounce`}>
          ✨ {toast}
        </div>
      )}
    </>
  );
}
