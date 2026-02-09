local claims = std.extVar('claims');

{
	identity: {
		traits: {
			email: claims.email,
			name: claims.name,
		},
	},
}
