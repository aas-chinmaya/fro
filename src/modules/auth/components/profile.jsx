"use client";

import { useEffect } from "react";
import {
	Fingerprint,
	Mail,
	Phone,
	RefreshCw,
	Shield,
	UserRound,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUserProfile } from "@/modules/auth/store/authSlice";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/avatar";

export default function Profile() {
	const dispatch = useAppDispatch();
	const { profile, profileLoading: isLoading, profileError: error } =
		useAppSelector((state) => state.auth);

	useEffect(() => {
		dispatch(fetchUserProfile());
	}, [dispatch]);

	function retryProfileRequest() {
		dispatch(fetchUserProfile());
	}

	const displayName = profile?.fullName || profile?.name || "Profile";
	const avatarSrc = [
		profile?.profilePicture,
		profile?.avatar,
		profile?.image,
	].find((source) => typeof source === "string" && source.trim());
	const initials = displayName
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("");
	const details = [
		{
			label: "Full name",
			value: profile?.fullName || profile?.name || "Not provided",
			icon: UserRound,
		},
		{
			label: "Email address",
			value: profile?.email || "Not provided",
			icon: Mail,
		},
		{
			label: "Contact number",
			value: profile?.contact || "Not provided",
			icon: Phone,
		},
		{
			label: "Account role",
			value: profile?.role || "Not provided",
			icon: Shield,
		},
		{
			label: "Account ID",
			value: profile?.id || "Not provided",
			icon: Fingerprint,
		},
	];

	return (
		<main className="mx-auto w-full max-w-5xl space-y-6">
			<header className="space-y-1">
				<p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
					Account
				</p>
				<h1 className="text-3xl font-semibold tracking-tight text-gray-950">
					My profile
				</h1>
				<p className="text-sm text-muted">
					View the personal information associated with your account.
				</p>
			</header>

			{isLoading ? (
				<section
					aria-label="Loading profile"
					className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
					role="status"
				>
					<div className="h-36 bg-secondary sm:h-44" />
					<div className="px-5 pb-6 sm:px-8">
						<div className="-mt-12 flex flex-col items-start gap-4 sm:-mt-14 sm:flex-row sm:items-end">
							<div className="h-24 w-24 rounded-2xl border-4 border-white bg-primary/20 sm:h-28 sm:w-28" />
							<div className="space-y-3 pb-1">
								<div className="h-6 w-44 max-w-full rounded bg-primary/15" />
								<div className="h-4 w-56 max-w-full rounded bg-primary/10" />
							</div>
						</div>
						<div className="mt-8 grid gap-4 sm:grid-cols-2">
							{details.map((detail) => (
								<div
									className="h-20 rounded-xl bg-gray-100"
									key={detail.label}
								/>
							))}
						</div>
					</div>
				</section>
			) : error ? (
				<section
					className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"
					role="alert"
				>
					<div>
						<h2 className="font-semibold text-gray-950">
							We couldn’t load your profile
						</h2>
						<p className="mt-1 text-sm text-red-700">{error}</p>
					</div>
					<button
						className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
						onClick={retryProfileRequest}
						type="button"
					>
						<RefreshCw aria-hidden="true" className="h-4 w-4" />
						Try again
					</button>
				</section>
			) : profile ? (
				<section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
					<div
						aria-hidden="true"
						className="relative h-36 overflow-hidden bg-gradient-to-r from-primary via-blue-500 to-indigo-500 sm:h-44"
					>
						<div className="absolute -right-8 -top-24 h-64 w-64 rounded-full border-[32px] border-white/10" />
						<div className="absolute -bottom-36 right-1/3 h-64 w-64 rounded-full border-[32px] border-white/10" />
					</div>

					<div className="px-5 pb-7 sm:px-8 sm:pb-9">
						<div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
							<div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
								<Avatar className="h-24 w-24 shrink-0 rounded-2xl border-4 border-white bg-white shadow-md sm:h-28 sm:w-28">
									{avatarSrc ? (
										<AvatarImage
											className="rounded-xl object-cover"
											src={avatarSrc}
											alt={`${displayName} profile picture`}
										/>
									) : null}
									<AvatarFallback className="rounded-xl bg-primary text-2xl font-semibold text-white">
										{initials || "U"}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0 pb-1">
									<h2 className="break-words text-2xl font-semibold tracking-tight text-gray-950">
										{displayName}
									</h2>
									<p className="mt-1 break-all text-sm text-muted">
										{profile.email || "Email not provided"}
									</p>
								</div>
							</div>
							{profile.role ? (
								<span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-secondary px-3.5 py-1.5 text-sm font-semibold capitalize text-primary">
									<Shield aria-hidden="true" className="h-4 w-4" />
									{profile.role}
								</span>
							) : null}
						</div>

						<div className="mt-8 border-t border-gray-100 pt-6">
							<div className="mb-4">
								<h3 className="text-lg font-semibold text-gray-950">
									Personal information
								</h3>
								<p className="mt-1 text-sm text-muted">
									Your account details in one place.
								</p>
							</div>
							<dl className="grid gap-3 sm:grid-cols-2">
								{details.map(({ label, value, icon: Icon }) => (
									<div
										className="flex min-w-0 items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4 transition-colors hover:bg-gray-50"
										key={label}
									>
										<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm ring-1 ring-gray-100">
											<Icon aria-hidden="true" className="h-5 w-5" />
										</span>
										<div className="min-w-0 pt-0.5">
											<dt className="text-xs font-semibold uppercase tracking-wide text-muted">
												{label}
											</dt>
											<dd className="mt-1 break-words text-sm font-medium text-gray-900">
												{value}
											</dd>
										</div>
									</div>
								))}
							</dl>
						</div>
					</div>
				</section>
			) : (
				<section className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
					<UserRound
						aria-hidden="true"
						className="mx-auto h-10 w-10 text-muted"
					/>
					<h2 className="mt-3 font-semibold text-gray-950">
						Profile information is unavailable
					</h2>
					<p className="mt-1 text-sm text-muted">
						Your account details could not be found.
					</p>
				</section>
			)}
		</main>
	);
}
