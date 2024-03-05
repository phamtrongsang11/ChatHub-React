import useClerkUser from '@/hooks/useClerkUser';
import {
	ControlBar,
	GridLayout,
	LiveKitRoom,
	ParticipantTile,
	RoomAudioRenderer,
	useTracks,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import { useEffect, useState } from 'react';
import Loading from './Loading';
import { axiosInstance } from '@/services/api-client';

interface MediaRoomProps {
	chatId: string;
	video: boolean;
	audio: boolean;
}

const serverUrl = 'wss://discord-tutorial-bp7ndoq5.livekit.cloud';

export const MediaRoom = ({ chatId, video, audio }: MediaRoomProps) => {
	const { user, isLoaded } = useClerkUser();
	const [token, setToken] = useState<string>('');
	const [isLoading, setIsLoading] = useState(false);
	useEffect(() => {
		const getLiveKitToken = async () => {
			try {
				setIsLoading(true);
				const { data } = await axiosInstance.get(
					`${import.meta.env.VITE_BASE_URL}/channels/token?user=${
						user?.id
					}&room=${chatId}`
				);
				setToken(data);
			} catch (error) {
				console.log(error);
			} finally {
				setIsLoading(false);
			}
		};
		if (isLoaded) getLiveKitToken();
	}, [isLoaded]);

	if (isLoading || !isLoaded) return <Loading />;

	return (
		<LiveKitRoom
			video={video}
			audio={audio}
			token={token}
			serverUrl={serverUrl}
			data-lk-theme="default"
			style={{ height: '100vh' }}
		>
			<MyVideoConference />
			<RoomAudioRenderer />
			<ControlBar />
		</LiveKitRoom>
	);
};

function MyVideoConference() {
	const tracks = useTracks(
		[
			{ source: Track.Source.Camera, withPlaceholder: true },
			{ source: Track.Source.ScreenShare, withPlaceholder: false },
		],
		{ onlySubscribed: false }
	);
	return (
		<GridLayout
			tracks={tracks}
			style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}
		>
			<ParticipantTile />
		</GridLayout>
	);
}
