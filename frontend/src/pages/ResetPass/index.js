import React, { useState } from "react";

import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form, Field } from "formik";

import {
	Avatar,
	Button,
	CssBaseline,
	TextField,
	Grid,
	Typography,
	Container,

	Link
} from '@mui/material';

import { LockOutlined } from '@mui/icons-material';


import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";


/* const useStyles = styled(theme => ({
	paper: {
		marginTop: theme.spacing(8),
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: "100%",
		marginTop: theme.spacing(3),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
}));
 */
const UserSchema = Yup.object().shape({


	email: Yup.string().email("Invalid email").required("Required"),
});

const ResetPass = () => {
	/* const classes = useStyles(); */
	const navigate = useNavigate();

	const initialState = { email: "" };

	const [user] = useState(initialState);

	const handleReset = async values => {
		try {
			await api.post("/auth/reset", values);
			toast.success(i18n.t("reset.toasts.success"), {
				style: {
					backgroundColor: "#D4EADD",
					color: "#64A57B"
				}

			});
			navigate("/login");
		} catch (err) {
			toastError(err);
		}
	};

	return (
		<Container component="main" maxWidth="xs">
			<CssBaseline />
			<div /* className={classes.paper} */>
				<Avatar /* className={classes.avatar} */>
					<LockOutlined />
				</Avatar>
				<Typography component="h1" variant="h5">
					{i18n.t("reset.title")}
				</Typography>
				<Formik
					initialValues={user}
					enableReinitialize={true}
					validationSchema={UserSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleReset(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting }) => (
						<Form /* className={classes.form} */>
							<Grid container spacing={2}>


								<Grid item xs={12}>
									<Field
										as={TextField}
										variant="outlined"
										fullWidth
										id="email"
										label={i18n.t("signup.form.email")}
										name="email"
										error={touched.email && Boolean(errors.email)}
										helperText={touched.email && errors.email}
										autoComplete="email"
									/>
								</Grid>

							</Grid>
							<Button
								type="submit"
								fullWidth
								variant="contained"
								color="primary"
								/* className={classes.submit} */
							>
								{i18n.t("reset.buttons.submit")}
							</Button>
							<Grid container justifyContent="flex-end">
								<Grid item>
									<Link
										href="#"
										variant="body2"
										component={RouterLink}
										to="/login"
									>
										{i18n.t("signup.buttons.login")}
									</Link>
								</Grid>
							</Grid>
						</Form>
					)}
				</Formik>
			</div>
		</Container>
	);
};

export default ResetPass;
