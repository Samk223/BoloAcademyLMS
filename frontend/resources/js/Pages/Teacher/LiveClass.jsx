"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import AgoraRTC from "agora-rtc-sdk-ng";
import {
  ArrowLeft,
  Copy,
  MessageCircle,
  Send,
  Smile,
  BarChart3,
  Wand2,
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  ScreenShare,
  X,
  Users,
  Trash2,
} from "lucide-react";
import { brutalBorder, brutalShadow, brutalShadowSm, brutalHover } from "../../utils/theme";

const EMOJIS = ["👏", "👍", "😂", "❤️", "🔥", "🎉", "🤔", "✅"];

export default function TeacherLiveClass({ roomId, userName, userId, studentJoinUrl }) {
  const channelName = useMemo(() => `liveclass.${roomId}`, [roomId]);
  const [connected, setConnected] = useState(Boolean(window?.Echo));

  const [messages, setMessages] = useState([]);
  const [chatText, setChatText] = useState("");

  const [lastReaction, setLastReaction] = useState(null);
  const [activePoll, setActivePoll] = useState(null);
  const [pollVoters, setPollVoters] = useState({});
  const [pollClosed, setPollClosed] = useState(false);
  const [pollComposerOpen, setPollComposerOpen] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", "", ""]);
  const [pollCorrectOptionIndex, setPollCorrectOptionIndex] = useState(null);
  const [toast, setToast] = useState(null);

  function showToast(message) {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }

  const [quizModal, setQuizModal] = useState(null);
  const [quizTopic, setQuizTopic] = useState("Past tense");
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizSubmissions, setQuizSubmissions] = useState([]);
  const [quizResultsReleased, setQuizResultsReleased] = useState(false);
  const [activeStudents, setActiveStudents] = useState([]);
  const [rtcStatus, setRtcStatus] = useState("Not joined");
  const [mediaError, setMediaError] = useState("");
  const [mediaActive, setMediaActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [copyToast, setCopyToast] = useState("");

  const chatEndRef = useRef(null);
  const videoMountRef = useRef(null);
  const agoraClientRef = useRef(null);
  const audioTrackRef = useRef(null);
  const videoTrackRef = useRef(null);
  const copyToastTimerRef = useRef(null);
  const joiningRef = useRef(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    const echo = window?.Echo;
    if (!echo) return;

    setConnected(true);

    const channel = echo.private(channelName);
    channel
      .listen(".live.chat.message", (e) => setMessages((prev) => [...prev, e.message]))
      .listen(".live.reaction", (e) => setLastReaction(e.reaction))
      .listen(".live.poll.created", (e) => {
        setActivePoll(e.poll);
        setPollVoters({});
        setPollClosed(false);
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
      })
      .listen(".live.quiz.sent", (e) => {
        setQuizModal(e.quiz);
        setQuizSubmissions([]);
        setQuizResultsReleased(false);
      })
      .listen(".live.quiz.answer_submitted", (e) => {
        setQuizSubmissions((prev) => {
          const exists = prev.some((s) => s.studentName === e.studentName);
          if (exists) return prev;
          return [...prev, { studentName: e.studentName, score: e.score }];
        });
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
    return () => {
      leaveAgora();
    };
  }, []);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await axios.get(`/api/live/${roomId}/students`);
        setActiveStudents(res.data.students || []);
      } catch (err) {
        console.error("Failed to fetch active students:", err);
      }
    }

    fetchStudents();
    const interval = setInterval(fetchStudents, 6000);

    return () => clearInterval(interval);
  }, [roomId]);

  async function banStudent(studentId) {
    if (!confirm("Are you sure you want to remove and ban this student from entering this live class again?")) return;
    try {
      await axios.post(`/api/live/${roomId}/ban`, { studentId });
      setActiveStudents((prev) => prev.filter((s) => s.id !== studentId));
    } catch (err) {
      console.error("Failed to ban student:", err);
    }
  }

  async function getAgoraClient() {
    if (agoraClientRef.current) return agoraClientRef.current;
    if (joiningRef.current) {
      while (joiningRef.current) {
        await new Promise((r) => setTimeout(r, 100));
      }
      if (agoraClientRef.current) return agoraClientRef.current;
    }

    joiningRef.current = true;
    setRtcStatus("Joining...");
    try {
      const res = await axios.post(`/api/live/${roomId}/agora/token`, { role: "publisher" });
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

      await client.join(res.data.appId, res.data.channel, res.data.token, res.data.uid);
      agoraClientRef.current = client;
      setRtcStatus("Joined");
      return client;
    } finally {
      joiningRef.current = false;
    }
  }

  function clearVideoMount() {
    videoMountRef.current?.replaceChildren();
  }

  function playTrack(track) {
    if (!videoMountRef.current) return;

    clearVideoMount();
    setMediaActive(true);
    track.play(videoMountRef.current);
  }

  async function stopCurrentVideoTrack() {
    const client = agoraClientRef.current;
    const track = videoTrackRef.current;
    if (!track) return;

    if (client) {
      try {
        await client.unpublish(track);
      } catch {
        // ignore already-unpublished tracks
      }
    }

    track.stop();
    track.close();
    videoTrackRef.current = null;
    setScreenSharing(false);
    setCameraActive(false);
    setMediaActive(false);
    clearVideoMount();
  }

  async function startCamera() {
    setMediaError("");

    try {
      const client = await getAgoraClient();

      if (!videoTrackRef.current || screenSharing) {
        await stopCurrentVideoTrack();
        videoTrackRef.current = await AgoraRTC.createCameraVideoTrack();
        await client.publish(videoTrackRef.current);
        setCameraActive(true);
      }

      setScreenSharing(false);
      playTrack(videoTrackRef.current);
      setRtcStatus(micActive ? "Camera/mic live" : "Camera live");
    } catch (error) {
      setMediaError(formatMediaError(error));
      setRtcStatus("Failed");
    }
  }

  async function startMic() {
    setMediaError("");

    try {
      const client = await getAgoraClient();

      if (!audioTrackRef.current) {
        audioTrackRef.current = await AgoraRTC.createMicrophoneAudioTrack();
        await client.publish(audioTrackRef.current);
      }

      setMicActive(true);
      setRtcStatus(videoTrackRef.current ? "Camera/mic live" : "Mic live");
    } catch (error) {
      setMediaError(formatMediaError(error));
      setRtcStatus("Failed");
    }
  }

  async function startScreenShare() {
    setMediaError("");

    try {
      const client = await getAgoraClient();

      if (!audioTrackRef.current) {
        audioTrackRef.current = await AgoraRTC.createMicrophoneAudioTrack();
        await client.publish(audioTrackRef.current);
        setMicActive(true);
      }

      await stopCurrentVideoTrack();

      const screenResult = await AgoraRTC.createScreenVideoTrack({ encoderConfig: "1080p_1" }, "auto");
      const screenVideoTrack = Array.isArray(screenResult) ? screenResult[0] : screenResult;

      screenVideoTrack.on("track-ended", () => {
        stopCurrentVideoTrack();
        setRtcStatus("Screen share stopped");
      });

      videoTrackRef.current = screenVideoTrack;
      await client.publish(screenVideoTrack);
      setCameraActive(false);
      setScreenSharing(true);
      playTrack(screenVideoTrack);
      setRtcStatus("Screen sharing live");
    } catch (error) {
      setMediaError(formatMediaError(error));
      setRtcStatus("Failed");
    }
  }

  async function stopCameraOrScreen() {
    await stopCurrentVideoTrack();
    setRtcStatus(micActive ? "Mic live" : "Joined");
  }

  async function stopMic() {
    const client = agoraClientRef.current;
    const track = audioTrackRef.current;
    if (!track) return;

    if (client) {
      try {
        await client.unpublish(track);
      } catch {
        // ignore already-unpublished tracks
      }
    }

    track.stop();
    track.close();
    audioTrackRef.current = null;
    setMicActive(false);
    setRtcStatus(videoTrackRef.current ? rtcStatus : "Joined");
  }

  function formatMediaError(error) {
    const message = error?.message || String(error || "");

    if (message.includes("PERMISSION_DENIED") || message.includes("Permission denied")) {
      return "Camera/mic permission is blocked. Click the browser permission icon near the address bar and allow camera/microphone.";
    }

    return message || "Could not start media sharing.";
  }

  async function endClassOnServer() {
    try {
      await axios.post(`/api/live/${roomId}/end`);
    } catch (e) {
      console.error("Failed to end class on server:", e);
    }
  }

  async function leaveAgora() {
    endClassOnServer();

    const client = agoraClientRef.current;
    const tracks = [audioTrackRef.current, videoTrackRef.current].filter(Boolean);

    if (client && tracks.length) {
      try {
        await client.unpublish(tracks);
      } catch {
        // ignore cleanup errors
      }
    }

    tracks.forEach((track) => {
      track.stop();
      track.close();
    });

    if (client) {
      try {
        await client.leave();
      } catch {
        // ignore cleanup errors
      }
    }

    audioTrackRef.current = null;
    videoTrackRef.current = null;
    agoraClientRef.current = null;
    setMediaActive(false);
    setCameraActive(false);
    setMicActive(false);
    setScreenSharing(false);
    setRtcStatus("Not joined");

    clearVideoMount();
  }

  async function copyStudentLink() {
    await navigator.clipboard.writeText(studentJoinLink);
    setCopyToast("Link copied");

    window.clearTimeout(copyToastTimerRef.current);
    copyToastTimerRef.current = window.setTimeout(() => setCopyToast(""), 1800);
  }

  async function sendChat() {
    const text = chatText.trim();
    if (!text) return;

    setChatText("");
    const res = await axios.post(`/api/live/${roomId}/chat`, { text });
    if (res?.data?.message) setMessages((prev) => [...prev, res.data.message]);
  }

  async function sendReaction(emoji) {
    const res = await axios.post(`/api/live/${roomId}/reaction`, { emoji });
    if (res?.data?.reaction) setLastReaction(res.data.reaction);
  }

  async function createPoll() {
    const question = pollQuestion.trim();
    const options = pollOptions.map((option) => option.trim()).filter(Boolean).slice(0, 6);
    if (!question || options.length < 2) return;

    try {
      const res = await axios.post(`/api/live/${roomId}/polls`, { question, options });
      const createdPoll = res.data.poll;
      if (pollCorrectOptionIndex !== null && createdPoll.options?.[pollCorrectOptionIndex]) {
        createdPoll.correctOptionId = createdPoll.options[pollCorrectOptionIndex].id;
      }
      setActivePoll(createdPoll);
      setPollVoters({});
      setPollClosed(false);
      setPollQuestion("");
      setPollOptions(["", "", ""]);
      setPollCorrectOptionIndex(null);
      setPollComposerOpen(false);
      showToast("Poll sent! 📊");
    } catch (e) {
      console.error("Failed to create poll:", e);
      showToast("Failed to send poll ❌");
    }
  }

  async function closePoll() {
    if (!activePoll || pollClosed) return;

    const finalResults = {
      question: activePoll.question,
      options: activePoll.options,
      votes: pollVotes,
      correctOptionId: activePoll.correctOptionId
    };

    try {
      const res = await axios.post(`/api/live/${roomId}/polls/close`, { 
        pollId: activePoll.id,
        results: finalResults
      });

      if (res.data?.poll) {
        setMessages((prev) => [
          ...prev,
          {
            id: "poll-result-" + activePoll.id,
            system: true,
            isPollResult: true,
            poll: res.data.poll
          }
        ]);
      }

      setActivePoll(null);
      setPollClosed(false);
      showToast("Poll closed & results shared! 📊");
    } catch (e) {
      console.error("Failed to close poll:", e);
      showToast("Failed to close poll ❌");
    }
  }

  async function generateQuiz() {
    const topic = quizTopic.trim();
    if (!topic) return;
    setQuizLoading(true);
    try {
      const res = await axios.post(`/api/live/${roomId}/quiz/generate`, {
        topic,
        count: 5,
        level: "easy",
      });
      setQuizModal(res.data.quiz);
      setQuizSubmissions([]);
      setQuizResultsReleased(false);
      showToast("Quiz sent! 🦉");
    } catch (e) {
      console.error("Failed to generate quiz:", e);
      showToast("Failed to generate quiz ❌");
    } finally {
      setQuizLoading(false);
    }
  }

  async function releaseQuizResults() {
    if (!quizModal || quizResultsReleased) return;

    try {
      await axios.post(`/api/live/${roomId}/quiz/results`, {
        quizId: quizModal.id,
        results: {
          leaderboard: quizSubmissions
        }
      });
      setQuizResultsReleased(true);
      showToast("Quiz results published! 🎉");
    } catch (e) {
      console.error("Failed to release quiz results:", e);
      showToast("Failed to release results ❌");
    }
  }

  const studentJoinLink = studentJoinUrl || route("student.live", roomId);
  const pollVotes = Object.values(pollVoters).reduce((totals, optionId) => {
    totals[optionId] = (totals[optionId] || 0) + 1;
    return totals;
  }, {});
  const canCreatePoll = pollQuestion.trim() && pollOptions.filter((option) => option.trim()).length >= 2;

  return (
    <>
      <Head title="Live Class (Teacher)" />
      <div className="h-screen overflow-y-auto bg-[#FFF8E7] text-[#1E1E1E] p-6 lg:p-10">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Link
                href={route("dashboard")}
                className={`px-4 py-3 bg-white rounded-2xl font-black flex items-center gap-2 ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}
              >
                <ArrowLeft size={18} strokeWidth={3} /> Back
              </Link>
              <div>
                <div className="text-3xl font-black flex items-center gap-3">
                  <Video size={28} strokeWidth={3} /> Live Class
                </div>
                <div className="font-bold text-gray-600">
                  Teacher: {userName} • Room: <span className="font-black">{roomId}</span>{" "}
                  {!connected && <span className="ml-2 text-red-600">Realtime not configured</span>}
                </div>
              </div>
            </div>

            <div className={`bg-white rounded-2xl px-4 py-3 ${brutalBorder} ${brutalShadowSm} flex items-center gap-3`}>
              <div className="font-black text-sm text-gray-600">Student link</div>
              <a className="font-black underline" href={studentJoinLink} target="_blank" rel="noreferrer">
                Open
              </a>
              <button
                onClick={copyStudentLink}
                className={`px-3 py-2 bg-[#E9D5FF] rounded-xl font-black ${brutalBorder} ${brutalShadowSm} ${brutalHover} flex items-center gap-2`}
              >
                <Copy size={16} strokeWidth={3} /> Copy
              </button>
            </div>
          </div>

          {copyToast && (
            <div className={`fixed right-8 top-8 z-50 bg-[#D1F2EB] px-5 py-3 rounded-2xl font-black ${brutalBorder} ${brutalShadowSm}`}>
              {copyToast}
            </div>
          )}

          {pollComposerOpen && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#1E1E1E]/40 p-4">
              <div className={`w-full max-w-xl bg-white rounded-[2rem] p-6 ${brutalBorder} ${brutalShadow}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-2xl font-black">Create Live Poll</div>
                  <button
                    onClick={() => setPollComposerOpen(false)}
                    className={`p-2 bg-white rounded-xl ${brutalBorder} ${brutalHover}`}
                  >
                    <X size={18} strokeWidth={3} />
                  </button>
                </div>
                <input
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className={`mt-5 w-full px-4 py-3 rounded-2xl bg-[#FFF8E7] font-bold outline-none ${brutalBorder}`}
                  placeholder="Poll question"
                />
                <div className="mt-4 space-y-3">
                  {pollOptions.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        value={option}
                        onChange={(e) => {
                          const next = [...pollOptions];
                          next[index] = e.target.value;
                          setPollOptions(next);
                        }}
                        className={`flex-1 px-4 py-3 rounded-2xl bg-white font-bold outline-none ${brutalBorder}`}
                        placeholder={`Option ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => setPollCorrectOptionIndex(index === pollCorrectOptionIndex ? null : index)}
                        className={`px-3 py-3 rounded-xl border-2 border-black font-black text-xs transition-all ${
                          index === pollCorrectOptionIndex 
                            ? 'bg-green-300 text-green-900' 
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        title="Mark as correct option"
                      >
                        {index === pollCorrectOptionIndex ? '✓ Correct' : 'Correct?'}
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setPollOptions((prev) => (prev.length >= 6 ? prev : [...prev, ""]))}
                  className={`mt-3 px-4 py-2 bg-[#FEF08A] rounded-xl font-black ${brutalBorder} ${brutalHover}`}
                >
                  Add option
                </button>
                <button
                  onClick={createPoll}
                  disabled={!canCreatePoll}
                  className={`mt-5 w-full py-3 rounded-2xl font-black ${brutalBorder} ${brutalShadowSm} ${
                    canCreatePoll ? "bg-[#D1F2EB] ".concat(brutalHover) : "bg-gray-100 opacity-60"
                  }`}
                >
                  Send Poll
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-2 bg-white rounded-[2.5rem] p-6 ${brutalBorder} ${brutalShadow} space-y-5`}>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="text-2xl font-black">Stage (Agora goes here)</div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={startCamera}
                    className={`px-4 py-3 bg-[#D1F2EB] rounded-2xl font-black ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}
                  >
                    <Video size={18} strokeWidth={3} className="inline mr-2" />
                    {cameraActive ? "Camera Live" : "Start Camera"}
                  </button>
                  <button
                    onClick={micActive ? stopMic : startMic}
                    className={`px-4 py-3 bg-white rounded-2xl font-black ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}
                  >
                    {micActive ? <MicOff size={18} strokeWidth={3} className="inline mr-2" /> : <Mic size={18} strokeWidth={3} className="inline mr-2" />}
                    {micActive ? "Mute Mic" : "Start Mic"}
                  </button>
                  <button
                    onClick={startScreenShare}
                    className={`px-4 py-3 bg-[#FEF08A] rounded-2xl font-black ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}
                  >
                    <ScreenShare size={18} strokeWidth={3} className="inline mr-2" />
                    {screenSharing ? "Sharing Screen" : "Share Screen"}
                  </button>
                  {(cameraActive || screenSharing) && (
                  <button
                    onClick={stopCameraOrScreen}
                    className={`px-4 py-3 bg-white rounded-2xl font-black ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}
                  >
                    <VideoOff size={18} strokeWidth={3} className="inline mr-2" />
                    {screenSharing ? "Stop Screen" : "Stop Video"}
                  </button>
                  )}
                  <button
                    onClick={leaveAgora}
                    className={`px-4 py-3 bg-white rounded-2xl font-black ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}
                  >
                    <PhoneOff size={18} strokeWidth={3} className="inline mr-2" />
                    Stop
                  </button>
                </div>
              </div>

              <div
                className={`relative h-[360px] bg-[#FFF8E7] rounded-[2rem] ${brutalBorder} overflow-hidden flex items-center justify-center`}
              >
                <div
                  ref={videoMountRef}
                  className="absolute inset-0 [&_video]:!w-full [&_video]:!h-full [&_video]:!object-cover"
                />
                {!mediaActive && (
                  <div className="relative z-10 text-center max-w-md px-6">
                    <div className="text-5xl mb-4">🎥</div>
                    <div className="text-xl font-black">Agora video/audio will mount here</div>
                    <div className="font-bold text-gray-600 mt-2">
                      Click Camera/Mic to start broadcasting to students.
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm font-black text-gray-600">
                <span>Status: {rtcStatus}</span>
                {screenSharing && <span className="text-purple-700">Screen share active</span>}
                {mediaError && <span className="text-red-600">{mediaError}</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`bg-[#D1F2EB] rounded-3xl p-5 ${brutalBorder} ${brutalShadowSm}`}>
                  <div className="font-black text-lg flex items-center gap-2">
                    <Smile size={20} strokeWidth={3} /> Reactions
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        onClick={() => sendReaction(e)}
                        className={`px-3 py-2 bg-white rounded-xl font-black ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                  {lastReaction && (
                    <div className="mt-3 font-bold text-gray-700">
                      Latest: <span className="font-black">{lastReaction.emoji}</span> by{" "}
                      <span className="font-black">{lastReaction.user?.name}</span>
                    </div>
                  )}
                </div>

                <div className={`bg-[#FEF08A] rounded-3xl p-5 ${brutalBorder} ${brutalShadowSm}`}>
                  <div className="font-black text-lg flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2"><BarChart3 size={20} strokeWidth={3} /> Polls</span>
                    {activePoll && (
                      <span className={`text-xs px-2 py-1 rounded-full ${brutalBorder} ${pollClosed ? "bg-gray-100" : "bg-[#D1F2EB]"}`}>
                        {pollClosed ? "Closed" : "Open"}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setPollComposerOpen(true)}
                    className={`w-full mt-4 py-3 bg-white rounded-2xl font-black ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}
                  >
                    Create Poll
                  </button>
                  {activePoll && (
                    <div className="mt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-black">{activePoll.question}</div>
                        {!pollClosed && (
                          <button
                            onClick={closePoll}
                            className={`px-3 py-1 bg-white rounded-xl text-sm font-black ${brutalBorder} ${brutalHover}`}
                          >
                            Close
                          </button>
                        )}
                      </div>
                      <div className="mt-2 space-y-2">
                        {activePoll.options?.map((o) => (
                          <div key={o.id} className={`bg-white rounded-2xl p-3 ${brutalBorder}`}>
                            <div className="flex items-center justify-between">
                              <div className="font-bold">{o.label}</div>
                              <div className="font-black">{pollVotes[o.id] || 0}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className={`bg-[#E9D5FF] rounded-3xl p-5 ${brutalBorder} ${brutalShadowSm}`}>
                  <div className="font-black text-lg flex items-center gap-2">
                    <Wand2 size={20} strokeWidth={3} /> AI Live Quiz
                  </div>
                  <input
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                    className={`mt-4 w-full px-4 py-3 rounded-2xl bg-white font-bold outline-none ${brutalBorder}`}
                    placeholder="Topic (e.g. Past tense)"
                  />
                  <button
                    onClick={generateQuiz}
                    disabled={quizLoading}
                    className={`w-full mt-3 py-3 bg-white rounded-2xl font-black ${brutalBorder} ${brutalShadowSm} ${
                      quizLoading ? "opacity-60" : brutalHover
                    }`}
                  >
                    {quizLoading ? "Generating..." : "Generate & Send"}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {/* Active Attendees Roster Widget */}
              <div className={`bg-[#E9D5FF] rounded-[2.5rem] p-6 ${brutalBorder} shadow-[6px_6px_0px_0px_#1E1E1E] flex flex-col`}>
                <div className="flex items-center justify-between gap-3 border-b-2 border-black pb-2 mb-3">
                  <div className="text-lg font-black flex items-center gap-2 text-[#1E1E1E]">
                    <Users size={20} strokeWidth={3} /> Online Students ({activeStudents.length})
                  </div>
                  <span className="font-black text-xs bg-white px-2 py-0.5 rounded-md border-2 border-black animate-pulse">
                    Live 🟢
                  </span>
                </div>

                <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1">
                  {activeStudents.length === 0 ? (
                    <div className="text-center py-6 font-bold text-gray-500 text-sm">
                      No students connected yet ⏳
                    </div>
                  ) : (
                    activeStudents.map((stud) => (
                      <div key={stud.id} className={`flex items-center justify-between p-2.5 bg-white rounded-xl ${brutalBorder} shadow-sm`}>
                        <div className="flex flex-col">
                          <span className="font-black text-sm text-[#1E1E1E] leading-tight">{stud.name}</span>
                          <span className="text-[10px] font-bold text-gray-500 leading-none mt-0.5">{stud.email}</span>
                        </div>
                        <button
                          onClick={() => banStudent(stud.id)}
                          className={`p-1.5 bg-red-100 text-red-600 rounded-lg border border-red-300 hover:bg-red-200 transition-colors flex items-center justify-center`}
                          title="Remove & Ban Student"
                        >
                          <Trash2 size={13} strokeWidth={3} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Card */}
              <div className={`bg-white rounded-[2.5rem] p-6 ${brutalBorder} ${brutalShadow} flex flex-col flex-1`}>
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
                    placeholder="Say something to students…"
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
      </div>

      {quizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E1E1E]/40 backdrop-blur-sm">
          <div className={`w-full max-w-3xl bg-white rounded-[2.5rem] p-6 ${brutalBorder} shadow-[12px_12px_0px_0px_#1E1E1E] flex flex-col max-h-[85vh]`}>
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b-3 border-[#1E1E1E] pb-4">
              <div>
                <h3 className="text-2xl font-black flex items-center gap-2">🦉 Active Live Quiz Dashboard</h3>
                <p className="font-bold text-gray-500 text-sm mt-0.5">Topic: "{quizModal.topic}" | Questions: {quizModal.questions?.length || 0}</p>
              </div>
              <button
                onClick={() => setQuizModal(null)}
                className={`px-4 py-2 rounded-xl bg-gray-50 font-black ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}
              >
                Minimize Tracker
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto my-4 space-y-6 pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Real-time Submissions Column */}
                <div className={`bg-[#FFF8E7] rounded-3xl p-5 ${brutalBorder}`}>
                  <h4 className="font-black text-lg mb-3 flex items-center gap-2">
                    📥 Student Responses ({quizSubmissions.length})
                  </h4>
                  
                  {quizSubmissions.length === 0 ? (
                    <div className="py-10 text-center space-y-2">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto border-2 border-black animate-spin">
                        ⏳
                      </div>
                      <p className="font-bold text-gray-500 text-sm animate-pulse">Waiting for students to submit answers...</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                      {quizSubmissions.map((s, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-3 bg-white rounded-xl ${brutalBorder} shadow-sm`}>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm">#{idx+1}</span>
                            <span className="font-black">{s.studentName}</span>
                          </div>
                          <span className="font-black bg-[#D1F2EB] px-3 py-1 rounded-lg border-2 border-black text-xs">
                            {s.score.correct} / {s.score.total} Correct
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Release Controls Column */}
                <div className={`bg-[#FFE5D9] rounded-3xl p-5 ${brutalBorder} flex flex-col justify-between`}>
                  <div>
                    <h4 className="font-black text-lg mb-2">📢 Results Release panel</h4>
                    <p className="font-bold text-gray-700 text-sm leading-snug">
                      Once students have submitted their answers, release the final correct answer keys, detailed explanation sheets, and the top classmates leaderboard!
                    </p>
                  </div>

                  <div className="mt-4">
                    {quizResultsReleased ? (
                      <div className="p-4 bg-green-100 text-green-800 rounded-2xl border-2 border-green-600 font-black text-center text-sm">
                        ✅ Results Released Successfully! Portals updated in real time.
                      </div>
                    ) : (
                      <button
                        onClick={releaseQuizResults}
                        className={`w-full py-4 rounded-2xl bg-white font-black text-base uppercase ${brutalBorder} ${brutalShadowSm} ${brutalHover} animate-[pulse_2s_infinite]`}
                      >
                        Release Answers & Live Results 🏆
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* Questions Review collapsible list */}
              <div className="border-t-3 border-dashed border-gray-300 pt-4">
                <div className="font-black text-lg mb-3">📋 Sent Questions Preview</div>
                <div className="space-y-3">
                  {quizModal.questions?.map((q, idx) => (
                    <div key={q.id || idx} className={`bg-gray-50 rounded-2xl p-4 ${brutalBorder}`}>
                      <div className="font-black text-sm">
                        Q{idx + 1}. {q.q}
                      </div>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {q.options?.map((o) => (
                          <div key={o.id} className={`p-2 rounded-xl font-bold border ${
                            o.id === q.answerId 
                              ? 'bg-green-50 border-green-400 text-green-700 font-black' 
                              : 'bg-white border-gray-300'
                          }`}>
                            {o.text} {o.id === q.answerId && '✓'}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-[999] bg-[#D1F2EB] text-[#1E1E1E] border-3 border-black p-4 px-6 rounded-2xl shadow-[6px_6px_0px_0px_#1E1E1E] font-black text-sm flex items-center gap-2 animate-bounce`}>
          ✨ {toast}
        </div>
      )}
    </>
  );
}
