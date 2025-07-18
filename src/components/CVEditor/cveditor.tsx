// import "./cveditor.sass";
import { CV, CVSection, Link } from "@/lib/types";
import * as UI from "./cvItemComponents"
import ItemBucket from "@/components/dnd/Bucket";
import { useStyles } from "./styles";

function CVEditor(props: {
	cv: CV,
	onUpdate?: (cv: CV) => void
}) {
	const { getAllStyles } = useStyles();

	const S = getAllStyles();

	const onSectionUpdate = (section: CVSection, i: number) => {
		console.debug("CVEditor.onSectionUpdate - RECEIVED:", {
			sectionType: section.bucket_type,
			sectionIndex: i,
			section
		});

		const new_sections = [...props.cv.sections];
		new_sections[i] = section;
		const updatedCV = {
			...props.cv,
			sections: new_sections
		};

		console.debug("CVEditor.onSectionUpdate - SENDING TO STORE:", {
			updatedCV
		});

		props.onUpdate?.(updatedCV);
	};

	const onBucketUpdate = (newVals: CVSection[]) => {
		props.onUpdate?.({
			...props.cv,
			sections: newVals
		})
	};

	// -------------- VIEW --------------

	const cv = props.cv;

	if (!cv) return null;

	const dynamic_styles: React.CSSProperties = {
		padding: `${S.page_padding_top}  ${S.page_padding_sides}`,
		fontFamily: "'Arial Narrow Bold', sans-serif",
		fontSize: S.p_font
	}

	return (
		<div
			className="h-full text-black grid auto-rows-min gap-y-[1%]"
			style={dynamic_styles}
		>
			{/* HEADER INFO --------------------------------------*/}
			<div
				title="full-name"
				className="text-center whitespace-nowrap font-extrabold"
				style={{fontSize: S.name_font}}
			>
				{cv.header_info.name}
			</div>
			<div
				title="link-list"
				className="flex justify-center gap-[2cqw]"
			>
				{cv.header_info?.links?.map((l: Link, i: number) =>
					<UI.LinkUI key={i} {...l} />
				)}
			</div>
			{/* SECTION BUCKET --------------------------------------*/}
			<ItemBucket<CVSection>
				id="sections"
				items={cv.sections.map((S: CVSection)=>({
					id: S.name,
					value: S
				}))}
				type="sections"
				onUpdate={onBucketUpdate}
				onItemUpdate={onSectionUpdate}
				addItemDisabled
			/>
		</div>
	);
};

export default CVEditor;