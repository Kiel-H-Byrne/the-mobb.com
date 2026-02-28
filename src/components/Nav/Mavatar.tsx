import { Menu } from "@ark-ui/react/menu";
import { useAuth0 } from "@auth0/auth0-react";
import { InfoTwoTone, ShareTwoTone } from "@mui/icons-material";
import { css } from "@styled/css";

const menuStyles = {
  content: css({
    backgroundColor: "rgba(68, 68, 68, 0.9)",
    borderRadius: "md",
    boxShadow: "lg",
    padding: "2",
    zIndex: "1000",
    minWidth: "150px",
  }),
  item: css({
    display: "flex",
    alignItems: "center",
    padding: "2",
    cursor: "pointer",
    _hover: {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    color: "white",
  }),
  image: css({
    height: "1rem",
    display: "flex",
  }),
  shareRow: css({
    display: "flex",
    justifyContent: "space-evenly",
    width: "100%",
  }),
  avatar: css({
    borderRadius: "full",
    width: "40px",
    height: "40px",
    objectFit: "cover",
  }),
};

const Mavatar = () => {
  const {
    isAuthenticated,
    user,
    error,
    isLoading,
  } = useAuth0();

  if (error) {
    console.error(error);
  }

  if (isAuthenticated) {
    console.log(user);
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        className={css({
          cursor: "pointer",
          border: "none",
          background: "transparent",
          padding: "0",
        })}
      >
        {!isLoading && isAuthenticated ? (
          <img
            src={user?.picture}
            alt={user?.name}
            className={menuStyles.avatar}
          />
        ) : (
          <img height="50px" src="img/Logo_MOBB-banner.png" alt={"MOBB"} />
        )}
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content className={menuStyles.content}>
          <Menu.Item value="share" className={menuStyles.item}>
            <ShareTwoTone style={{ marginRight: "8px" }} />
            <div className={menuStyles.shareRow}>
              <a
                href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2FMOBB%2Ekielbyrne%2Ecom&amp;title=Locate%2C+Promote%2C+%26+Support+a+Business+Owned+By+Us%2E"
                target="_blank"
                rel="noreferrer noopener"
                title="Share on Facebook"
              >
                <img
                  src="/img/fbook-share.png"
                  alt="Share on Facebook"
                  className={menuStyles.image}
                />
              </a>
              <a
                href="https://www.linkedin.com/shareArticle?mini=true&amp;url=https%3A%2F%2FMOBB%2Ekielbyrne%2Ecom&amp;title=Locate%2C+Promote%2C+%26+Support+a+Business+Owned+By+Us%2E&amp;source=mobb%2Ekielbyrne%2Ecom"
                target="_blank"
                rel="noreferrer noopener"
                title="Share on LinkedIn"
              >
                <img
                  src="/img/linkedin-share.png"
                  alt="Share on LinkedIn"
                  className={menuStyles.image}
                />
              </a>
              <a
                href="https://twitter.com/intent/tweet?text=Locate%2C+Promote%2C+%26+Support+a+Business+Owned+By+Us%3A+MOBB%2Ekielbyrne%2Ecom"
                target="_blank"
                rel="noreferrer noopener"
                title="Share on Twitter"
              >
                <img
                  src="/img/twitter-share.png"
                  alt="Share on Twitter"
                  className={menuStyles.image}
                />
              </a>
            </div>
          </Menu.Item>
          <Menu.Item value="about" className={menuStyles.item}>
            <InfoTwoTone style={{ marginRight: "8px" }} />
            <span>About</span>
          </Menu.Item>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
};

export default Mavatar;
