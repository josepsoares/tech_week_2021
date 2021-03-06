import React from 'react';
import { Helmet } from 'react-helmet';

const SEO: React.FC<{ title: string; description: string }> = ({
  title,
  description,
}) => {
  return (
    <Helmet
      title={title}
      meta={[
        {
          name: `description`,
          content: description,
        },
      ]}
    />
  );
};

export default SEO;
