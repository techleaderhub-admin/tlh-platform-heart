<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Authentication uses the managed email/password provider; phone sign-in resolves the existing auth email only in a server function so account identifiers and privileged credentials never reach the browser.
- Protected pages live under the client-only `_authenticated` route gate, with role checks backed by the existing `user_roles` records.
